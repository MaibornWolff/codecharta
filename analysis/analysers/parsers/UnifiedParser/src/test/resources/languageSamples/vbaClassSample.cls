VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "clsCustomer"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Option Compare Database
Option Explicit
Implements IEntity

Private mName As String
Public Event Changed(ByVal newName As String)

Public Property Get Name() As String
    Name = mName
End Property

Public Property Let Name(ByVal value As String)
    mName = value
    RaiseEvent Changed(value)
End Property

Public Sub Load(ByVal id As Long)
    mName = DLookup("CompanyName", "tblCustomers", "CustomerID=" & id)
End Sub

Private Sub Class_Initialize()
End Sub

#If VBA7 Then
Private Declare PtrSafe Function GetTickCount Lib "kernel32" () As Long
#Else
Private Declare Function GetTickCount Lib "kernel32" () As Long
#End If
