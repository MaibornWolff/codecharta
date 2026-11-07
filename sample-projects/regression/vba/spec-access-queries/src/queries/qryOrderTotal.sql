SELECT OrderDetails.OrderID, Sum([Quantity]*[UnitPrice]) AS OrderTotal
FROM OrderDetails
GROUP BY OrderDetails.OrderID;
