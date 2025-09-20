import { Injectable } from '@angular/core';
import { NgxDhis2HttpClientService } from '@iapps/ngx-dhis2-http-client';
import moment from 'moment';
import { Observable, of, zip } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  DataSets,
  ReportingToolsResponseModel,
} from 'src/app/shared/models/reporting-tools.models';

import { flatten, keyBy } from 'lodash';
import { each } from 'highcharts';
@Injectable({
  providedIn: 'root',
})
export class ReportingToolsService {
  constructor(private httpClient: NgxDhis2HttpClientService) {}

  getFacilitiesWithNumberOfDataSets(
    ouId: any,
    level: number,
    page?: number,
    pageCount?: number,
    searchingText?: string,
    userSupportKeys?: string[],
    multipleOrgUnits: boolean = false
  ): Observable<ReportingToolsResponseModel> {
    if (multipleOrgUnits && Array.isArray(ouId)) {
      return zip(
        ...ouId.map((orgUnit: any) => {
          return this.httpClient
            .get(
              `organisationUnits.json?${page ? 'page=' + page + '&' : ''}${
                pageCount ? 'pageSize=' + pageCount + '&' : ''
              }filter=level:eq:${level}&fields=id,name,dataSets~size,programs~size,closedDate,parent[id,name,level,parent[id,name,level]]${
                searchingText ? '&filter=name:ilike:' + searchingText : ''
              }&filter=path:ilike:${orgUnit?.id}`
            )
            .pipe(
              map((response) => {
                return response?.organisationUnits;
              }),
              catchError((error) => of(error))
            );
        })
      ).pipe(
        map((responses) => {
          const allOrgUnits = flatten(responses);
          return {
            organisationUnits: allOrgUnits,
            data: allOrgUnits
              .filter((ou) => !ou?.closedDate)
              .map((orgUnit) => {
                const matchedKeys =
                  userSupportKeys.filter(
                    (key) => key?.indexOf(orgUnit?.id) > -1
                  ) || [];
                return {
                  ...orgUnit,
                  hasPendingRequest: matchedKeys?.length > 0,
                  keys: matchedKeys,
                  timeSinceResponseSent:
                    matchedKeys.length > 0
                      ? moment(
                          Number(matchedKeys[0].split('_')[0].replace('DS', ''))
                        ).fromNow()
                      : '',
                  date:
                    matchedKeys.length > 0
                      ? Date.now() -
                        Number(matchedKeys[0].split('_')[0].replace('DS', ''))
                      : null,
                };
              }),
            pagination: {
              page: 1,
              pageCount: allOrgUnits.length,
              total: allOrgUnits.length,
              pageSize: allOrgUnits.length,
              nextPage: null,
              itemPerPageOptions: [10, 20, 30, 50],
            },
          };
        }),
        catchError((error) => of(error))
      );
    }

    ouId = Array.isArray(ouId) ? ouId[0]?.id : ouId;

    return this.httpClient
      .get(
        `organisationUnits.json?${page ? 'page=' + page + '&' : ''}${
          pageCount ? 'pageSize=' + pageCount + '&' : ''
        }filter=level:eq:${level}&fields=id,name,dataSets~size,programs~size,closedDate,parent[id,name,level,parent[id,name,level]]${
          searchingText ? '&filter=name:ilike:' + searchingText : ''
        }&filter=path:ilike:${ouId}`
      )
      .pipe(
        map((response) => {
          return {
            organisationUnits: response?.organisationUnits,
            data: response?.organisationUnits
              .filter((ou) => !ou?.closedDate)
              .map((orgUnit) => {
                const matchedKeys =
                  userSupportKeys.filter(
                    (key) => key?.indexOf(orgUnit?.id) > -1
                  ) || [];
                return {
                  ...orgUnit,
                  hasPendingRequest: matchedKeys?.length > 0,
                  keys: matchedKeys,
                  timeSinceResponseSent:
                    matchedKeys.length > 0
                      ? moment(
                          Number(matchedKeys[0].split('_')[0].replace('DS', ''))
                        ).fromNow()
                      : '',
                  date:
                    matchedKeys.length > 0
                      ? Date.now() -
                        Number(matchedKeys[0].split('_')[0].replace('DS', ''))
                      : null,
                };
              }),
            pagination: {
              ...response?.pager,
              itemPerPageOptions: [10, 20, 30, 50],
            },
          };
        }),
        catchError((error) => of(error))
      );
  }

  getAssignedDataSets(ouId: string): Observable<DataSets[]> {
    return this.httpClient
      .get(
        `organisationUnits/${ouId}.json?fields=dataSets[id,name],attributeValues`
      )
      .pipe(
        map((response) => {
          return response?.dataSets;
        }),
        catchError((error) => of(error))
      );
  }

  getAssignedProgramsAndDataSets(ouId: string): Observable<DataSets[]> {
    return zip(
      this.httpClient
        .get(
          `organisationUnits/${ouId}.json?fields=programs[id,name],attributeValues`
        )
        .pipe(
          map((response) => {
            return response?.programs;
          }),
          catchError((error) => of(error))
        ),
      this.httpClient
        .get(
          `organisationUnits/${ouId}.json?fields=dataSets[id,name],attributeValues`
        )
        .pipe(
          map((response) => {
            return response?.dataSets;
          }),
          catchError((error) => of(error))
        )
    ).pipe(
      map((responses: any[]) => {
        return flatten(responses);
      }),
      catchError((error) => of(error))
    );
  }

  getAllDataSets(datasetClosedDateAttribute: {
    id: string;
    name?: string;
  }): Observable<DataSets[]> {
    return this.httpClient
      .get(
        `dataSets.json?paging=false&fields=id,name,attributeValues,categoryCombo[id,name,categoryOptionCombos[id,name,categoryOptions[id,name]]]`
      )
      .pipe(
        map((response) => {
          return (
            datasetClosedDateAttribute
              ? response?.dataSets.filter(
                  (dataSet) =>
                    (
                      dataSet?.attributeValues?.filter(
                        (attributeValue) =>
                          attributeValue?.attribute?.id ===
                          datasetClosedDateAttribute?.id
                      ) || []
                    ).length === 0
                ) || []
              : response?.dataSets
          )?.map((dataSet) => {
            return {
              ...dataSet,
              type: 'DATASET',
              categoryOptions: flatten(
                (
                  dataSet?.categoryCombo?.categoryOptionCombos?.filter(
                    (option) => option?.name !== 'default'
                  ) || []
                )?.map(
                  (categoryOptionCombo) => categoryOptionCombo?.categoryOptions
                )
              ),
            };
          });
        }),
        catchError((error) => of(error))
      );
  }

  getCategoryOptionsDetails(
    categoryOptions: any,
    organisationUnit: any,
    dataSetAttributesData?: any
  ): Observable<any> {
    let dataSetAttributesDataSelections = {};
    let dataSetAttributesDataDeletions = {};
    dataSetAttributesDataSelections =
      dataSetAttributesData && dataSetAttributesData?.attributesData?.length > 0
        ? {
            ...dataSetAttributesDataSelections,
            ...keyBy(
              flatten(
                dataSetAttributesData?.attributesData.map((attrData) =>
                  attrData?.additions.map((addition) => {
                    return {
                      ...addition,
                      key: addition?.id + '_' + attrData?.categoryOption?.id,
                    };
                  })
                )
              ),
              'key'
            ),
          }
        : null;

    dataSetAttributesDataDeletions =
      dataSetAttributesData && dataSetAttributesData?.attributesData?.length > 0
        ? {
            ...dataSetAttributesDataDeletions,
            ...keyBy(
              flatten(
                dataSetAttributesData?.attributesData.map((attrData) =>
                  attrData?.deletions.map((deletion) => {
                    return {
                      ...deletion,
                      key: deletion?.id + '_' + attrData?.categoryOption?.id,
                    };
                  })
                )
              ),
              'key'
            ),
          }
        : null;
    return zip(
      ...categoryOptions?.map((categoryOption) => {
        return this.httpClient
          .get(
            `categoryOptions/${categoryOption?.id}.json?fields=id,name,sharing,organisationUnits[id]`
          )
          .pipe(
            map((response) => {
              return response?.organisationUnits?.map((ou) => {
                return {
                  ...ou,
                  ou: ou?.id,
                  ouCategoryOption: ou?.id + '_' + categoryOption?.id,
                  categoryOption: {
                    ...categoryOption,
                    organisationUnits: response?.organisationUnits,
                  },
                };
              });
            })
          );
      })
    ).pipe(
      map((responses) => {
        return dataSetAttributesDataSelections
          ? {
              ...dataSetAttributesDataSelections,
              ...keyBy(
                !dataSetAttributesDataDeletions
                  ? flatten(responses)
                  : flatten(responses)?.filter(
                      (categoryOption: any) =>
                        !dataSetAttributesDataDeletions[
                          categoryOption?.ouCategoryOption
                        ]
                    ) || [],
                'ouCategoryOption'
              ),
            }
          : keyBy(
              !dataSetAttributesDataDeletions
                ? flatten(responses)
                : flatten(responses)?.filter(
                    (categoryOption: any) =>
                      !dataSetAttributesDataDeletions[
                        categoryOption?.ouCategoryOption
                      ]
                  ) || [],
              'ouCategoryOption'
            );
      })
    );
  }
}
