Attribute VB_Name = "modNav"
Option Explicit

Public Sub ArchiveOrders()
    Dim records As Object
    DoCmd.OpenQuery "qryArchive"
    Set records = CurrentDb.OpenRecordset("qryOrders")
    Debug.Print CurrentDb.QueryDefs("qryOrderTotal").SQL
    Set records = CurrentDb.OpenRecordset("SELECT * FROM qryOrderTotal")
    DoCmd.OpenQuery "qryMissing"
End Sub

Public Function EmployeeName(ByVal employeeId As Long) As String
    EmployeeName = DLookup("FullName", "qryEmployees", "EmployeeID = " & employeeId)
End Function
