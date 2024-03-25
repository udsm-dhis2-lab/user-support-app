import { Component, Input, OnInit } from '@angular/core';
import { Observable, map } from 'rxjs';
import { OrgUnitsProvisionalService } from 'src/app/core/services/organisationunits.service';
import { orderBy } from 'lodash';
import { Store } from '@ngrx/store';
import { State } from 'src/app/store/reducers';
import { getCurrentTranslations } from 'src/app/store/selectors/translations.selectors';

@Component({
  selector: 'app-user-account-request-container',
  templateUrl: './user-account-request-container.component.html',
  styleUrls: ['./user-account-request-container.component.css'],
})
export class UserAccountRequestContainerComponent implements OnInit {
  @Input() currentUser: any;
  @Input() systemConfigs: any;
  @Input() configurations: any;
  levels$: Observable<any>;
translations$: Observable<any>;
  constructor(private orgUnitPrivisionalService: OrgUnitsProvisionalService,
    private store: Store<State>
    ) {}

  ngOnInit(): void {
    this.translations$ = this.store.select(getCurrentTranslations);
    this.levels$ = this.orgUnitPrivisionalService.getOrgUnitLevels(1).pipe(
      map((orgUnitLevels: any) => {
        return orderBy(orgUnitLevels, ['level'], ['asc']);
      })
    );
  }

  get isSecondTier(): boolean {
    return (
      (
        (this.currentUser?.userGroups || []).filter(
          (userGroup) =>
            (
              this.configurations?.tier2?.filter(
                (tier) => tier?.id === userGroup?.id
              ) || []
            )?.length > 0
        ) || []
      )?.length > 0
    );
  }

  get isFeedbackRecepient(): boolean {
    return (
      (this.currentUser?.userGroups || []).filter(
        (userGroup) =>
          userGroup?.id === this.systemConfigs?.feedbackRecipients?.id
      ) || []
    )?.length > 0 ||
      this.currentUser?.keyedAuthorities['US_USER_ACCOUNT_REQUESTS_VIEW'] ||
      this.currentUser?.keyedAuthorities['US_USER_ACCOUNT_APPROVE']
      ? true
      : false;
  }
}
