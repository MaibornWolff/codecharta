INSERT INTO OrdersArchive ( OrderID )
SELECT qryOrders.OrderID FROM qryOrders;
