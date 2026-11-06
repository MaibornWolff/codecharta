Attribute VB_Name = "CodeChartaExport"
Option Compare Database

Option Explicit

Public Sub ExportForCodeCharta()
    Dim folder As String
    folder = CurrentProject.path & "\codecharta-export\"
    CreateFolders folder, Array("vba", "forms", "reports", "queries", "macros")
    ExportModules folder & "vba\"
    ExportDesigns folder
    ExportQueries folder & "queries\"
    MsgBox "Done: " & folder
End Sub

Private Sub CreateFolders(ByVal root As String, ByVal names As Variant)
    Dim files As Object, name As Variant
    Set files = CreateObject("Scripting.FileSystemObject")
    If Not files.FolderExists(root) Then files.CreateFolder root
    For Each name In names
        If Not files.FolderExists(root & name) Then files.CreateFolder root & name
    Next
End Sub

Private Sub ExportModules(ByVal folder As String)
    Dim project As Object, part As Object
    For Each project In Application.VBE.VBProjects
        If project.FileName = CurrentProject.FullName Then Exit For
    Next
    For Each part In project.VBComponents
        part.Export folder & part.name & IIf(part.Type = 1, ".bas", ".cls")
    Next
End Sub

Private Sub ExportDesigns(ByVal folder As String)
    Dim item As AccessObject
    For Each item In CurrentProject.AllForms
        SaveAsText acForm, item.name, folder & "forms\" & item.name & ".form"
    Next
    For Each item In CurrentProject.AllReports
        SaveAsText acReport, item.name, folder & "reports\" & item.name & ".report"
    Next
    For Each item In CurrentProject.AllMacros
        SaveAsText acMacro, item.name, folder & "macros\" & item.name & ".macro"
    Next
End Sub

Private Sub ExportQueries(ByVal folder As String)
    Dim query As Object
    For Each query In CurrentDb.QueryDefs
        If Left(query.name, 1) <> "~" Then WriteText folder & query.name & ".sql", query.sql
    Next
End Sub

Private Sub WriteText(ByVal path As String, ByVal text As String)
    Dim fileNumber As Integer
    fileNumber = FreeFile
    Open path For Output As #fileNumber
    Print #fileNumber, text
    Close #fileNumber
End Sub

