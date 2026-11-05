package de.maibornwolff.treesitter.excavationsite.languages.vba

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class VbaExtractionTest {
    @Test
    fun `should extract the names a module declares`() {
        // Arrange
        val code = """
            Public Type TPoint
                X As Long
            End Type
            Private Enum EColor
                Red = 1
            End Enum
            Private Const TAX_RATE As Double = 0.19
            Dim total As Currency, count
            Private Declare PtrSafe Function GetTickCount Lib "kernel32" () As Long
            Public Event Changed(ByVal newName As String)
            Public Function OrderTotal(ByVal orderId As Long) As Currency
                Static calls As Long
            End Function
            Sub OpenOrders()
            End Sub
            Property Get Name() As String
            End Property
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.VBA)

        // Assert
        assertThat(result.identifiers).isEqualTo(
            listOf(
                "TPoint", "X", "EColor", "Red", "TAX_RATE", "total", "count", "GetTickCount", "Changed", "newName",
                "OrderTotal", "orderId", "calls", "OpenOrders", "Name"
            )
        )
    }

    @Test
    fun `should extract the name of a procedure whose header is split by a conditional directive`() {
        // Arrange
        val code = """
            #If VBA7 Then
            Public Function Tick() As LongPtr
            #Else
            Public Function Tick() As Long
            #End If
            End Function
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.VBA)

        // Assert
        assertThat(result.identifiers).isEqualTo(listOf("Tick"))
    }

    @Test
    fun `should extract apostrophe and REM comments without their markers`() {
        // Arrange
        val code = """
            ' Calculates the order total
            Rem legacy note
            Sub A()
                MsgBox "x" '  trailing
            End Sub
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.VBA)

        // Assert
        assertThat(result.comments).isEqualTo(listOf("Calculates the order total", "legacy note", "trailing"))
    }

    @Test
    fun `should extract string literals without quotes and with doubled quotes unescaped`() {
        // Arrange
        val code = listOf("Sub A()", "    MsgBox \"Say \"\"hello\"\"\"", "    DoCmd.OpenForm \"frmOrders\"", "End Sub").joinToString("\n")

        // Act
        val result = TreeSitterExtraction.extract(code, Language.VBA)

        // Assert
        assertThat(result.strings).isEqualTo(listOf("Say \"hello\"", "frmOrders"))
    }
}
