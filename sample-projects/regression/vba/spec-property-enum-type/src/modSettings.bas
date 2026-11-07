Attribute VB_Name = "modSettings"
Option Explicit
Private mLevel As Long

Public Property Get Level() As Long
    Level = mLevel
End Property

Public Property Let Level(ByVal value As Long)
    mLevel = value
End Property
