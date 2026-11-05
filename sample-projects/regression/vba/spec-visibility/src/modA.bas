Attribute VB_Name = "modA"
Option Explicit
Public gVar As Long
Global gOld As Long
Dim mPrivateVar As Long
Const PRIVATE_CONST = 1
Public Const PUBLIC_CONST = 2

Public Function Shown() As Long
End Function

Private Function Hidden() As Long
End Function

Function Implicit() As Long
End Function
