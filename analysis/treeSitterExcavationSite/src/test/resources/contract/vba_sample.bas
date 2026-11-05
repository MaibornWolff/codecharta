Attribute VB_Name = "modOrders"
Option Compare Database
Option Explicit

' Calculates the order total
Private Const TAX_RATE As Double = 0.19
Public gCount As Long

Public Function OrderTotal(ByVal orderId As Long, Optional discount As Double = 0) As Currency
    Dim rs As DAO.Recordset
    Dim total As Currency
    On Error GoTo ErrHandler
    Set rs = CurrentDb.OpenRecordset("SELECT * FROM tblOrderDetails WHERE OrderID = " & orderId)
    Do While Not rs.EOF
        If rs!Quantity > 10 And discount = 0 Or rs!Special Then
            total = total + rs!Price * rs!Quantity * 0.9
        ElseIf rs!Quantity > 5 Then
            total = total + rs!Price * rs!Quantity
        Else
            total = total + Nz(rs!Price, 0)
        End If
        rs.MoveNext
    Loop
    Select Case total
        Case Is > 1000: total = total * (1 - discount)
        Case 0 To 10
            total = 10
        Case Else
    End Select
    For i = 1 To 3: gCount = gCount + 1: Next i
    For Each ctl In Forms!frmOrders.Controls
        If TypeOf ctl Is TextBox Then ctl.Value = Null
    Next ctl
    OrderTotal = total * (1 + TAX_RATE)
    Exit Function
ErrHandler:
    MsgBox Err.Description  ' show error
    Resume Next
End Function

Sub OpenOrders()
    DoCmd.OpenForm "frmOrders", acNormal, , "OrderID = 1"
    DoCmd.OpenQuery "qryOpenOrders"
    DoCmd.OpenReport "rptInvoice", acViewPreview
    Call modHelpers.LogMessage("opened")
    Dim c As New clsCustomer
    c.Load 5
    While gCount < 3
        gCount = gCount + 1
    Wend
    With Me.Recordset
        .MoveFirst
    End With
    Application.CurrentProject.AllForms("frmOrders").Properties.Item(0).Value = 1
    REM legacy comment
End Sub
