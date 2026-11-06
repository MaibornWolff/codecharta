Attribute VB_Name = "modMain"
Option Explicit

Public Sub Start(ByVal button As Object, ByVal shape As Object)
    Application.Run "modReports.PrintAll", 2026
    Run "'Sales.xlsm'!RefreshPivots"
    button.OnAction = "modMenu.Go"
    Debug.Print Eval("Bonus() * 2")
    Debug.Print CallByName(shape, "Area", VbMethod)
End Sub
