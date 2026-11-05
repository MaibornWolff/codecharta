Attribute VB_Name = "modDates"
Option Explicit

Public Function ToAccessDate(ByVal value As Date) As String
    ToAccessDate = Format(value, "yyyy-mm-dd")
End Function
