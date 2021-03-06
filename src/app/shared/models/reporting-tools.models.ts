export interface FacilitiesWithNumberOfDatasets {
  id: string;
  name: string;
  dataSets: Number;
  parent: {
    id: string;
    name: string;
  };
  hasPendingRequest?: boolean;
  timeSinceResponseSent?: number;
}

export interface FacilityModel {
  id: string;
  name: string;
  parent: {
    id: string;
    name: string;
  };
}

export interface PaginationModel {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  nextPage: string;
}

export interface ReportingToolsResponseModel {
  data: FacilitiesWithNumberOfDatasets;
  pagination: PaginationModel;
}

export interface DataSets {
  id: string;
  name: string;
  assigned?: boolean;
  hasPendingRequest?: boolean;
}
