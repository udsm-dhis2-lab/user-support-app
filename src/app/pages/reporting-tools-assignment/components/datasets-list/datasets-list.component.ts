import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { DataSetsService } from 'src/app/core/services/dataset.service';
import { DataStoreDataService } from 'src/app/core/services/datastore.service';
import { MessagesDataService } from 'src/app/core/services/messages.service';
import { OuSelectionFormRequestModalComponent } from '../ou-selection-form-request-modal/ou-selection-form-request-modal.component';

@Component({
  selector: 'app-datasets-list',
  templateUrl: './datasets-list.component.html',
  styleUrls: ['./datasets-list.component.css'],
})
export class DatasetsListComponent implements OnInit {
  dataSetsDetails$: Observable<any[]>;
  pageSize: number = 10;
  page: number = 1;
  itemPerPage: number = 10;
  searchingText: string;
  currentDataSet: any;
  showConfirmButtons: boolean = false;
  updating: boolean = false;
  reasonForCancellingRequest: string;

  @Input() currentUser: any;
  @Input() configurations: any;
  @Input() systemConfigs: any;
  @Input() userSupportDataStoreKeys: any;

  @Output() dataStoreChanged = new EventEmitter<boolean>();

  constructor(
    private dataSetsService: DataSetsService,
    private dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private dataStoreService: DataStoreDataService,
    private messageService: MessagesDataService
  ) {}

  ngOnInit(): void {
    this.dataSetsDetails$ = this.dataSetsService.getDatasetsPaginated(
      {
        page: this.page,
        pageSize: this.pageSize,
        userSupportDataStoreKeys: this.userSupportDataStoreKeys,
      },
      this.configurations?.datasetClosedDateAttribute
    );
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action);
  }

  searchDataset(event: any): void {
    this.searchingText = event.target.value;
    this.page = 1;
    this.dataSetsDetails$ = this.dataSetsService.getDatasetsPaginated(
      {
        page: this.page,
        pageSize: this.pageSize,
        searchingText: this.searchingText,
        userSupportDataStoreKeys: this.userSupportDataStoreKeys,
      },
      this.configurations?.datasetClosedDateAttribute
    );
  }

  getItemsPerPage(event: any, pager: any): void {
    this.pageSize = Number(event.target.value);
    this.page = 1;
    this.itemPerPage = this.pageSize;
    this.dataSetsDetails$ = this.dataSetsService.getDatasetsPaginated(
      {
        page: this.page,
        pageSize: this.pageSize,
        userSupportDataStoreKeys: this.userSupportDataStoreKeys,
      },
      this.configurations?.datasetClosedDateAttribute
    );
  }

  getDataSets(event: Event, actionType, pager: any): void {
    event.stopPropagation();
    this.page = actionType === 'next' ? pager?.page + 1 : pager?.page - 1;
    this.dataSetsDetails$ = this.dataSetsService.getDatasetsPaginated(
      {
        page: this.page,
        pageSize: this.pageSize,
        userSupportDataStoreKeys: this.userSupportDataStoreKeys,
      },
      this.configurations?.datasetClosedDateAttribute
    );
  }

  onRequestDataSet(event: Event, dataSet: any): void {
    event.stopPropagation();
    this.dialog
      .open(OuSelectionFormRequestModalComponent, {
        width: '50%',
        data: {
          dataSet,
          currentUser: this.currentUser,
          configurations: this.configurations,
          systemConfigs: this.systemConfigs,
        },
      })
      .afterClosed()
      .subscribe((res) => {
        this.dataStoreChanged.emit(res);
        // this.dataSetsDetails$ = this.dataSetsService.getDatasetsPaginated({
        //   page: this.page,
        //   pageSize: this.pageSize,
        //   searchingText: this.searchingText,
        //   userSupportDataStoreKeys: this.userSupportDataStoreKeys,
        // },
        // this.configurations?.datasetClosedDateAttribute);
      });
  }

  onCancelAll(event: Event, dataSetDetails: any, confirm: boolean): void {
    event.stopPropagation();
    this.currentDataSet = dataSetDetails;
    if (confirm) {
      this.showConfirmButtons = false;
      this.updating = true;
      this.messageService
        .getMessagesMatchingTicketNumbers(dataSetDetails?.keys)
        .subscribe((messageResponse) => {
          if (messageResponse) {
            this.dataStoreService
              .deleteAllKeysAndUpdateMessage(
                dataSetDetails?.keys,
                messageResponse,
                this.reasonForCancellingRequest
              )
              .subscribe((response) => {
                if (response) {
                  // TODO: Add support to handle errors
                  this.reasonForCancellingRequest = null;
                  this.updating = false;
                  this.openSnackBar(
                    'Successfully cancelled all requests',
                    'Close'
                  );

                  // this.dataStoreChanged.emit(true);
                  setTimeout(() => {
                    this._snackBar.dismiss();
                  }, 2000);
                }
              });
          }
        });
    } else {
      this.showConfirmButtons = true;
    }
  }
}
