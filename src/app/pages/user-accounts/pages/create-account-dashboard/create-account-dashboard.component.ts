import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { DataStoreDataService } from 'src/app/core/services/datastore.service';

@Component({
  selector: 'app-create-account-dashboard',
  templateUrl: './create-account-dashboard.component.html',
  styleUrls: ['./create-account-dashboard.component.css'],
})
export class CreateAccountDashboardComponent implements OnInit {
  configurations$: Observable<any>;
  constructor(private dataStoreDataService: DataStoreDataService) {}

  ngOnInit(): void {
    this.configurations$ =
      this.dataStoreDataService.getUserSupportConfigurations();
  }
}
