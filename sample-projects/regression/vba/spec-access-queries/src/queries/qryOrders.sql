SELECT Orders.OrderID, qryOrderTotal.OrderTotal, ToAccessDate(Orders.OrderDate) AS Ordered
FROM Orders INNER JOIN qryOrderTotal ON Orders.OrderID = qryOrderTotal.OrderID
WHERE Orders.OrderDate >= [Forms]![frmMainMenu]![txtStartDate] AND Nz(Orders.Closed, False) = False;
