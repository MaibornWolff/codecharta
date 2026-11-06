Attribute VB_Name = "modMath"
Option Explicit

Public Function LogOpen()
    DoCmd.RunMacro "mcrLog"
End Function

Public Sub Cleanup()
    DoCmd.DeleteObject acMacro, "mcrOld"
End Sub
