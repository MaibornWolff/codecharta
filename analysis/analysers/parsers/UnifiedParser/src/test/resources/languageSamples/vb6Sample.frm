VERSION 5.00
Begin VB.Form frmMain
   Caption         =   "Main"
   ClientHeight    =   3195
   Begin VB.CommandButton cmdOk
      Caption         =   "OK"
      Height          =   495
   End
   Begin VB.TextBox Text1
      Height          =   285
   End
End
Attribute VB_Name = "frmMain"
Attribute VB_GlobalNameSpace = False
Option Explicit

' Closes the form once the text box holds a value
Private Sub cmdOk_Click()
    Dim x As Integer
    x = IIf(Text1.Text = "", 0, 1)
    If x > 0 Then Unload Me
End Sub

Private Function IsReady(ByVal text As String, Optional strict As Boolean) As Boolean
    Select Case Len(text)
        Case 0
            IsReady = False
        Case Else
            IsReady = Not strict Or Text1.Enabled
    End Select
End Function
