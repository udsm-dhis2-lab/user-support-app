import { Injectable } from '@angular/core';
import { NgxDhis2HttpClientService } from '@iapps/ngx-dhis2-http-client';
import { Observable, of, zip } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ApproveFeedbackService {
  constructor(private httpClient: NgxDhis2HttpClientService) {}

  approveChanges(data: any): Observable<any> {
    console.log(data);
    if (data?.method === 'POST') {
      return zip(
        this.httpClient.post(data?.url, data?.payload),
        this.httpClient.delete(`dataStore/dhis2-user-support/${data?.id}`),
        this.httpClient.post(
          `messageConversations/${data?.messageConversation?.id}`,
          data?.approvalMessage
        ),
        this.httpClient.post(
          `messageConversations/${data?.messageConversation?.id}/status?messageConversationStatus=SOLVED`,
          null
        )
      ).pipe(
        map((response) => response),
        catchError((error) => of(error))
      );
    } else if (data?.method === 'PUT') {
      return this.httpClient.put(data?.url, data?.payload).pipe(
        map((response) => response),
        catchError((error) => of(error))
      );
    } else {
      return of(null);
    }
  }

  rejectDataSetAssignment(data: any): Observable<any> {
    return zip(
      this.httpClient.put(`dataStore/dhis2-user-support/${data?.id}`, data),
      this.httpClient.post(
        `messageConversations/${data?.messageConversation?.id}`,
        data?.rejectionReasonMessage
      )
    ).pipe(
      map((response) => response),
      catchError((error) => error)
    );
  }
}
