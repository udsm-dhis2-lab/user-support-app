import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { DataStoreDataService } from 'src/app/core/services/datastore.service';
import { MessagesDataService } from 'src/app/core/services/messages.service';
import { ReportingToolsService } from 'src/app/core/services/reporting-tools.service';
import { OrgUnitLevelsModel } from 'src/app/shared/models/organisation-units.model';
import {
  FacilitiesWithNumberOfDatasets,
  PaginationModel,
  ReportingToolsResponseModel,
} from 'src/app/shared/models/reporting-tools.models';
import { SystemConfigsModel } from 'src/app/shared/models/system-configurations.model';
import { RequestFormModalComponent } from '../request-form-modal/request-form-modal.component';
import { MatSelectChange } from '@angular/material/select';
import { getCurrentTranslations } from 'src/app/store/selectors/translations.selectors';
import { Store } from '@ngrx/store';
import { State } from 'src/app/store/reducers';
@Component({
  selector: 'app-facilities-list',
  templateUrl: './facilities-list.component.html',
  styleUrls: ['./facilities-list.component.css'],
})
export class FacilitiesListComponent implements OnInit {
  @Input() currentUser: any;
  @Input() userSupportKeys: string[];
  @Input() configurations: any;
  @Input() systemConfigs: SystemConfigsModel;
  @Input() orgUnitLevels: OrgUnitLevelsModel;
  @Output() dataStoreChanged = new EventEmitter<boolean>();
  searchingText: string;
  reportingToolsResponse$: Observable<ReportingToolsResponseModel>;
  translations$: Observable<any>;
  pageCount: number = 10;
  lowestLevel: number;
  updating: boolean = false;
  showConfirmButtons: boolean = false;
  currentOrgUnit: any;
  reasonForCancellingRequest: string;
  constructor(
    private reportingToolsService: ReportingToolsService,
    private dataStoreService: DataStoreDataService,
    private messageService: MessagesDataService,
    private dialog: MatDialog,
    private store: Store<State>,
    private _snackBar: MatSnackBar,
  ) {}

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action);
  }

  ngOnInit(): void {
    this.translations$ = this.store.select(getCurrentTranslations);

    this.lowestLevel = this.orgUnitLevels[0]?.level;
    let currentPage;
    currentPage = localStorage.getItem('currentFacilityListPage');
    if (Number(currentPage)) {
      currentPage = 1;
    }
    localStorage.setItem('currentFacilityListPage', '1');
    this.reportingToolsResponse$ =
      this.reportingToolsService.getFacilitiesWithNumberOfDataSets(
        this.currentUser?.organisationUnits[0]?.id,
        this.lowestLevel,
        Number(currentPage),
        this.pageCount,
        null,
        this.userSupportKeys
      );
  }

  searchFacility(event: any): void {
    this.searchingText = event.target.value;
    this.reportingToolsResponse$ =
      this.reportingToolsService.getFacilitiesWithNumberOfDataSets(
        this.currentUser?.organisationUnits[0]?.id,
        this.lowestLevel,
        1,
        this.pageCount,
        this.searchingText,
        this.userSupportKeys
      );
  }

  onLevelChange(event: MatSelectChange): void {
    this.lowestLevel = event?.value?.level;
    let currentPage;
    currentPage = localStorage.getItem('currentFacilityListPage');
    if (Number(currentPage)) {
      currentPage = 1;
    }
    localStorage.setItem('currentFacilityListPage', '1');
    this.reportingToolsResponse$ =
      this.reportingToolsService.getFacilitiesWithNumberOfDataSets(
        this.currentUser?.organisationUnits,
        this.lowestLevel,
        Number(currentPage),
        this.pageCount,
        null,
        this.userSupportKeys,
        true
      );
  }

  getFacilities(
    event: Event,
    type: string,
    paginationDetails: PaginationModel
  ): void {
    event.stopPropagation();
    const currentPage =
      type === 'next'
        ? paginationDetails?.page + 1
        : paginationDetails?.page - 1;
    localStorage.setItem('currentFacilityListPage', currentPage.toString());
    this.reportingToolsResponse$ =
      this.reportingToolsService.getFacilitiesWithNumberOfDataSets(
        this.currentUser?.organisationUnits[0]?.id,
        this.lowestLevel,
        currentPage,
        this.pageCount,
        this.searchingText,
        this.userSupportKeys
      );
  }

  openRequestFormModal(
    event: Event,
    dataRow: FacilitiesWithNumberOfDatasets,
    userSupportKeys: String[],
    systemConfigs: SystemConfigsModel,
    currentUser: any
  ): void {
    event.stopPropagation();
    this.dialog
      .open(RequestFormModalComponent, {
        width: '70%',
        data: {
          facility: dataRow,
          userSupportKeys,
          systemConfigs,
          currentUser,
          configurations: this.configurations,
        },
      })
      .afterClosed()
      .subscribe((response) => {
        this.dataStoreChanged.emit(true);
      });
  }

  getItemsPerPage(event: any, paginationDetails: PaginationModel): void {
    this.pageCount = Number(event.target.value);
    const currentPage = paginationDetails?.page;
    this.reportingToolsResponse$ =
      this.reportingToolsService.getFacilitiesWithNumberOfDataSets(
        this.currentUser?.organisationUnits[0]?.id,
        this.lowestLevel,
        currentPage,
        this.pageCount,
        this.searchingText,
        this.userSupportKeys
      );
  }

  onCancelAll(event: Event, data: any, ou: any, confirm: boolean): void {
    event.stopPropagation();
    this.currentOrgUnit = ou;
    if (confirm) {
      this.showConfirmButtons = false;
      this.updating = true;
      this.messageService
        .getMessagesMatchingTicketNumbers(data?.keys)
        .subscribe((messageResponse) => {
          if (messageResponse) {
            this.dataStoreService
              .deleteAllKeysAndUpdateMessage(
                data?.keys,
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

                  this.dataStoreChanged.emit(true);
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

  onUnConfirm(event: Event): void {
    event.stopPropagation();
    this.showConfirmButtons = false;
  }
}
