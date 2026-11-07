VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "Form_frmDetails"
Option Explicit
Private Sub Form_Load()
    Forms!frmMain.Requery
    x = Reports("rptStock").Caption
    DoCmd.OpenForm "frmNoCode"
    DoCmd.OpenForm Me.Name
End Sub
