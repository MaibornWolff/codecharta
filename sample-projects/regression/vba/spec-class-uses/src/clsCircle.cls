VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "clsCircle"
Option Explicit
Implements IShape
Public Event Moved(ByVal target As clsPoint)

Private Sub IShape_Draw()
    Dim other As Object
    If TypeOf other Is clsPoint Then Set other = New clsCircle
End Sub
