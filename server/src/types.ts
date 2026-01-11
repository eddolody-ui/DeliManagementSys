// types/OrderSchema.ts
export interface OrderSchema {
  TrackingId: string;
  CustomerName: string;
  CustomerContact?: string;
  CustomerAddress?: string;
  Amount: number;
  Type: string;
  Note?: string;
}
    