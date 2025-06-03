import { Component, Input, OnInit } from '@angular/core';
import { AccountabilityService } from '../../services/accountability.service';
import { map, Observable, of } from 'rxjs';
import { orderBy, sortBy } from 'lodash';
import { MatSelectChange } from '@angular/material/select';
import {
  getStartAndEndDatesUsingQuarter,
  getYears,
} from 'src/app/core/helpers/format-dates.helper';

@Component({
  selector: 'app-accountability-list',
  templateUrl: './accountability-list.component.html',
  styleUrl: './accountability-list.component.css',
})
export class AccountabilityListComponent implements OnInit {
  @Input() userGroup: { id: string; name: string };
  @Input() currentUser: any;
  responsibilityPayload$: Observable<any>;
  selectedPeriod: any;
  years: number[];
  selectedYear: number = new Date().getFullYear();
  selectedQuarter: string;
  selectedPeriodType: string;
  periods: any[];

  constructor(private accountabilityService: AccountabilityService) {}

  ngOnInit(): void {
    this.years = getYears(2012);
  }

  getAccountabilityData(selectedPeriod: any): void {
    this.responsibilityPayload$ = of(null);
    this.responsibilityPayload$ = this.accountabilityService
      .getUsersAndMessageConversations(this.userGroup?.id, selectedPeriod)
      .pipe(map((response: any) => orderBy(response, ['count'], ['desc'])));
  }

  onYearChange(event: MatSelectChange): void {
    this.selectedYear = event.value;

    if (this.selectedQuarter) {
      this.selectedPeriod = getStartAndEndDatesUsingQuarter(
        this.selectedQuarter,
        this.selectedYear
      );
      this.getAccountabilityData(this.selectedPeriod);
    }
  }

  onPeriodTypeChange(event: MatSelectChange): void {
    this.selectedPeriodType = event?.value;
    this.periods = [];
    if (this.selectedPeriodType == 'Monthly') {
      this.periods = [
        {
          name: 'January',
          startDate: this.selectedYear + '-01-01',
          endDate: this.selectedYear + '-01-31',
        },
        {
          name: 'February',
          startDate: this.selectedYear + '-02-01',
          endDate:
            this.selectedYear % 4 === 0
              ? this.selectedYear + '-02-29'
              : this.selectedYear + '-02-28',
        },
        {
          name: 'March',
          startDate: this.selectedYear + '-03-01',
          endDate: this.selectedYear + '-03-31',
        },
        {
          name: 'April',
          startDate: this.selectedYear + '-04-1',
          endDate: this.selectedYear + '-04-30',
        },
        {
          name: 'May',
          startDate: this.selectedYear + '-05-01',
          endDate: this.selectedYear + '-05-31',
        },
        {
          name: 'June',
          startDate: this.selectedYear + '-06-01',
          endDate: this.selectedYear + '-06-30',
        },
        {
          name: 'July',
          startDate: this.selectedYear + '-07-01',
          endDate: this.selectedYear + '-07-31',
        },
        {
          name: 'August',
          startDate: this.selectedYear + '-08-01',
          endDate: this.selectedYear + '-08-31',
        },
        {
          name: 'September',
          startDate: this.selectedYear + '-09-01',
          endDate: this.selectedYear + '-09-30',
        },
        {
          name: 'October',
          startDate: this.selectedYear + '-10-01',
          endDate: this.selectedYear + '-10-31',
        },
        {
          name: 'November',
          startDate: this.selectedYear + '-11-01',
          endDate: this.selectedYear + '-11-30',
        },
        {
          name: 'December',
          startDate: this.selectedYear + '-12-01',
          endDate: this.selectedYear + '-12-31',
        },
      ];
    } else {
      this.periods = [
        {
          name: 'Jan-March',
          startDate: this.selectedYear + '-01-01',
          endDate: this.selectedYear + '-03-31',
        },
        {
          name: 'April-June',
          startDate: this.selectedYear + '-04-01',
          endDate: this.selectedYear + '-06-30',
        },
        {
          name: 'July-September',
          startDate: this.selectedYear + '-07-01',
          endDate: this.selectedYear + '-09-30',
        },
        {
          name: 'October-December',
          startDate: this.selectedYear + '-10-01',
          endDate: this.selectedYear + '-12-31',
        },
      ];
    }
  }

  onPeriodChange(event: MatSelectChange): void {
    this.selectedPeriod = event.value;
    if (this.selectedPeriod?.startDate && this.selectedPeriod?.endDate) {
      this.getAccountabilityData(this.selectedPeriod);
    }
  }
}
