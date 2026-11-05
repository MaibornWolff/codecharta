VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "Form_frmOrders"
Option Explicit
Private Sub cmdInvoice_Click()
    If CurrentProject.AllForms("frmMain").IsLoaded Then Exit Sub
    DoCmd.OpenReport "rptInvoice", acViewPreview
    DoCmd.OpenForm FormName:="frmDetails"
End Sub
