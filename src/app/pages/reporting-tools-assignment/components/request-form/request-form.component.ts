import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { mergeDataSetsWithAssignedOnes } from 'src/app/shared/helpers/merge-assigned-datasets.helper';
import {
  DataSets,
  FacilityModel,
} from 'src/app/shared/models/reporting-tools.models';
import { keyBy } from 'lodash';
import { DataStoreDataService } from 'src/app/core/services/datastore.service';
import {
  constructMessageForFacilityAssignment,
  getDataStoreDetailsForFormRequests,
} from 'src/app/shared/helpers/construct-message.helper';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MessagesAndDatastoreService } from 'src/app/core/services/messages-and-datastore.service';

@Component({
  selector: 'app-request-form',
  templateUrl: './request-form.component.html',
  styleUrls: ['./request-form.component.css'],
})
export class RequestFormComponent implements OnInit {
  @Input() assignedDataSets: DataSets[];
  @Input() allDataSets: DataSets[];
  @Input() userSupportKeys: string[];
  @Input() facility: FacilityModel;
  @Input() dataStoreMessageDetails: any[];
  mergedDataSets: DataSets[];
  @Output() assignmentDetails = new EventEmitter<any>();
  searchingText: string;
  showConfirmingButtons: boolean = false;
  currentDataset: DataSets;
  updatingRequest: boolean = false;
  constructor(
    private dataStoreService: DataStoreDataService,
    private messageAndDataStoreService: MessagesAndDatastoreService,
    private _snackBar: MatSnackBar
  ) {}

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action);
  }

  ngOnInit(): void {
    this.mergedDataSets = mergeDataSetsWithAssignedOnes(
      this.assignedDataSets,
      this.allDataSets,
      this.dataStoreMessageDetails
    );
    this.assignedDataSets = this.mergedDataSets;
  }

  toggleAssignment(
    event: Event,
    dataSetDetails: DataSets,
    mergedDataSets: DataSets[],
    action: string
  ): void {
    event.stopPropagation();
    this.mergedDataSets = mergedDataSets.map((dataSet) => {
      return {
        ...dataSet,
        assigned:
          dataSet?.id === dataSetDetails?.id && action === 'Remove'
            ? false
            : dataSet?.id === dataSetDetails?.id && action === 'Assign'
            ? true
            : dataSet?.assigned,
      };
    });
    const keyedAssignedDatasets = keyBy(this.assignedDataSets, 'id');
    const assignmentData = {
      deletions: this.mergedDataSets.filter(
        (dataSet) =>
          keyedAssignedDatasets[dataSet?.id]?.assigned && !dataSet?.assigned
      ),
      additions: this.mergedDataSets.filter(
        (dataSet) =>
          !keyedAssignedDatasets[dataSet?.id]?.assigned && dataSet?.assigned
      ),
      assigned: this.mergedDataSets.filter((dataSet) => dataSet?.assigned),
    };
    this.assignmentDetails.emit(assignmentData);
  }

  onCancelRequest(
    event: Event,
    requestDetails: any,
    mergedDataSets: DataSets[],
    confirm: boolean
  ): void {
    event.stopPropagation();
    this.currentDataset = requestDetails;
    if (confirm) {
      this.showConfirmingButtons = false;
      this.updatingRequest = true;
      // Update the cancelled request
      this.mergedDataSets = mergedDataSets.map((dataSet) => {
        return {
          ...dataSet,
          assigned:
            requestDetails?.id === dataSet?.id
              ? requestDetails?.assigned
              : dataSet?.assigned,
          hasPendingRequest:
            requestDetails?.id === dataSet?.id
              ? false
              : dataSet?.hasPendingRequest,
        };
      });
      const newPayload = {
        deletions:
          requestDetails?.details?.payload?.deletions?.length > 0
            ? requestDetails?.details?.payload?.deletions.filter(
                (deletion) => deletion?.id !== requestDetails?.id
              ) || []
            : [],
        additions:
          requestDetails?.details?.payload?.additions?.length > 0
            ? requestDetails?.details?.payload?.additions.filter(
                (addition) => addition?.id !== requestDetails?.id
              ) || []
            : [],
      };
      setTimeout(() => {
        this.showConfirmingButtons = false;
      }, 1000);
      const assignmentDetails = {
        ...newPayload,
        organisationUnit: this.facility,
        ticketNumber: requestDetails?.details?.ticketNumber,
      };
      const message = constructMessageForFacilityAssignment(assignmentDetails);
      const messageData = {
        subject: requestDetails?.details?.message?.subject,
        messageType: 'TICKET',
        text: 'Kuna mabadiliko, \n\n' + message?.message,
        message: 'Kuna mabadiliko, \n\n' + message?.message,
      };

      const dataStorePayload =
        getDataStoreDetailsForFormRequests(assignmentDetails);
      const data = {
        ...requestDetails?.details,
        message: messageData,
        ticketNumber: requestDetails?.details?.ticketNumber,
        ...dataStorePayload,
        payload: newPayload,
      };

      // TODO: Handle error on update

      this.messageAndDataStoreService
        .searchMessageConversationByTicketNumber(
          requestDetails?.details?.ticketNumber
        )
        .subscribe((messageConversationResponse) => {
          if (messageConversationResponse && messageConversationResponse?.id) {
            this.dataStoreService
              .updateKeyAndCreateMessage(data?.id, data, {
                text: 'Kuna mabadiliko, \n\n' + data?.message?.text,
                id: messageConversationResponse?.id,
              })
              .subscribe((response) => {
                if (response) {
                  this.updatingRequest = false;
                  this.openSnackBar('Successfully updated request', 'Close');
                  setTimeout(() => {
                    this._snackBar.dismiss();
                  }, 2000);
                }
              });
          }
        });
    } else {
      this.showConfirmingButtons = true;
    }
  }

  onUnConfirm(event: Event): void {
    event.stopPropagation();
    this.showConfirmingButtons = false;
  }
}
