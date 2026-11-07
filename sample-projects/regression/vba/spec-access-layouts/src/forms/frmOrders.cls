VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "Form_frmOrders"
Option Compare Database
Option Explicit

Private Function ShowInfo()
    MsgBox "Orders"
End Function

Private Sub Form_Open(Cancel As Integer)
    Me.Requery
End Sub
