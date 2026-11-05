VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "clsCustomer"
Option Explicit
Private mTotal As Long

Public Sub Load()
    mTotal = modOrders.Total
End Sub
