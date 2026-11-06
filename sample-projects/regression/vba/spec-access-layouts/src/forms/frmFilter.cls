VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "Form_frmFilter"
Option Compare Database
Option Explicit

Private Sub cboType_AfterUpdate()
    Me.Requery
End Sub
