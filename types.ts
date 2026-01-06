
export enum MPRSStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  ORDERED = 'Ordered'
}

export interface MPRSItem {
  id: string;
  mprs_no: string;
  mprs_date: string;
  item_name: string;
  specification: string;
  quantity: number | string;
  unit: string;
  purpose: string;
  lead_time: number | string;
  item_code: string;
  remarks: string;
  status: MPRSStatus;
  created_at: string;
}

export interface Requisition {
  mprs_no: string;
  mprs_date: string;
  items: MPRSItem[];
  status: MPRSStatus;
  title: string;
  department: string;
}

export interface HistoryItem {
  date: string;
  quantity: string | number;
  purpose: string;
}
