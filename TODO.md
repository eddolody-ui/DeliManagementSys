# TODO: Add Delivery Town Selection with COD Fee Addition

## Tasks
- [ ] Update OrderSchema in server/src/config/db.ts to include TownShip (string) and DeliFee (number)
- [ ] Update OrderSchema in server/src/types.ts to include TownShip and DeliFee
- [ ] Update client/src/features/home/pages/CreateOrder.tsx:
  - [ ] Add Select component for TownShip with predefined towns and fees (e.g., Yangon: 5000, Mandalay: 3000)
  - [ ] When TownShip is selected, set DeliFee accordingly
  - [ ] Add logic: if Type is "COD", total Amount = product Amount + DeliFee; else, total Amount = product Amount
  - [ ] Fix the TownShip input field (currently misusing Amount)
- [x] Test order creation to ensure delivery fee is added correctly when COD is selected
