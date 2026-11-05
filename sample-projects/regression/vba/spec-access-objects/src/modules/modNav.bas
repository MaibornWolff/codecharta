Attribute VB_Name = "modNav"
Option Explicit
Public Sub ShowMain()
    DoCmd.OpenForm "frmMain"
    Reports!rptStock.Visible = True
End Sub
