Attribute VB_Name = "modMath"
Option Compare Database
Option Explicit

Public Function Rounded(ByVal value As Double) As Double
    Rounded = Round(value, 2)
End Function

Public Function DueDate(ByVal orderDate As Date) As Date
    DueDate = orderDate + 30
End Function

Public Sub OpenLines()
    DoCmd.OpenForm "sfrmLines"
    DoCmd.OpenReport "rptInvoice", acViewPreview
End Sub
