// types/OrderSchema.ts
export interface OrderSchema {
  TrackingId: string;
  CustomerName: string;
  CustomerContact?: string;
  CustomerAddress?: string;
  TownShip: string;
  DeliFee: number;
  Amount: number;
  Type: string;
  Note?: string;
}
    