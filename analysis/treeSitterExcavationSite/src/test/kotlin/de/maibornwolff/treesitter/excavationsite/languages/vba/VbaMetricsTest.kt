package de.maibornwolff.treesitter.excavationsite.languages.vba

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterMetrics
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.ValueSource

class VbaMetricsTest {
    private fun inSub(vararg statements: String): String {
        val indentedStatements = statements.map { "    $it" }
        return (listOf("Sub Main()") + indentedStatements + "End Sub").joinToString("\n")
    }

    @Nested
    inner class LogicComplexity {
        @Test
        fun `should count an If block and its ElseIf but not its Else`() {
            // Arrange
            val code = inSub("If a > 1 Then", "    b = 1", "ElseIf a > 0 Then", "    b = 2", "Else", "    b = 3", "End If")

            // Act
            val result = TreeSitterMetrics.parse(code, Language.VBA)

            // Assert
            assertThat(result.logicComplexity).isEqualTo(2.0)
        }

        @Test
        fun `should count a single-line If`() {
            // Arrange
            val code = inSub("If a Then b = 1 Else b = 2")

            // Act
            val result = TreeSitterMetrics.parse(code, Language.VBA)

            // Assert
            assertThat(result.logicComplexity).isEqualTo(1.0)
        }

        @Test
        fun `should count every Case of a Select Case including Case Else`() {
            // Arrange
            val code =
                inSub(
                    "Select Case a",
                    "    Case 1",
                    "        b = 1",
                    "    Case 2, 3",
                    "        b = 2",
                    "    Case Else",
                    "        b = 3",
                    "End Select"
                )

            // Act
            val result = TreeSitterMetrics.parse(code, Language.VBA)

            // Assert
            assertThat(result.logicComplexity).isEqualTo(3.0)
        }

        @ParameterizedTest
        @ValueSource(
            strings = [
                "For i = 1 To 3\n        a = a + i\n    Next i",
                "For Each item In items\n        a = a + 1\n    Next item",
                "Do While a < 3\n        a = a + 1\n    Loop",
                "Do\n        a = a + 1\n    Loop Until a > 3",
                "While a < 3\n        a = a + 1\n    Wend"
            ]
        )
        fun `should count a loop`(loop: String) {
            // Arrange
            val code = inSub(loop)

            // Act
            val result = TreeSitterMetrics.parse(code, Language.VBA)

            // Assert
            assertThat(result.logicComplexity).isEqualTo(1.0)
        }

        @Test
        fun `should count each logical operator in a condition`() {
            // Arrange
            val code = inSub("If a > 1 And b Or c Xor d Then", "    e = 1", "End If")

            // Act
            val result = TreeSitterMetrics.parse(code, Language.VBA)

            // Assert
            assertThat(result.logicComplexity).isEqualTo(4.0)
        }

        @Test
        fun `should count a logical operator between plain operands`() {
            // Arrange
            val code = inSub("If a And b Then c = 1")

            // Act
            val result = TreeSitterMetrics.parse(code, Language.VBA)

            // Assert
            assertThat(result.logicComplexity).isEqualTo(2.0)
        }

        @Test
        fun `should count a logical operator outside a condition like Delphi does`() {
            // Arrange
            val code = inSub("a = b And 255", "c = IIf(a > 1 Or b, 1, 2)", "d = a + b * 2 Mod 3")

            // Act
            val result = TreeSitterMetrics.parse(code, Language.VBA)

            // Assert
            assertThat(result.logicComplexity).isEqualTo(3.0)
        }

        @Test
        fun `should count a logical operator continued on the next line`() {
            // Arrange
            val code = inSub("If a > 1 And _", "        b > 2 Then c = 1")

            // Act
            val result = TreeSitterMetrics.parse(code, Language.VBA)

            // Assert
            assertThat(result.logicComplexity).isEqualTo(2.0)
        }

        @Test
        fun `should count an error handler given by label or line number`() {
            // Arrange
            val code = inSub("On Error GoTo ErrHandler", "On Error GoTo 100", "100 a = 1", "ErrHandler:")

            // Act
            val result = TreeSitterMetrics.parse(code, Language.VBA)

            // Assert
            assertThat(result.logicComplexity).isEqualTo(2.0)
        }

        @Test
        fun `should not count On Error statements that set no handler`() {
            // Arrange
            val code = inSub("On Error Resume Next", "On Error GoTo 0", "On Error GoTo -1")

            // Act
            val result = TreeSitterMetrics.parse(code, Language.VBA)

            // Assert
            assertThat(result.logicComplexity).isEqualTo(0.0)
        }

        @Test
        fun `should count IIf in any letter case`() {
            // Arrange
            val code = inSub("a = IIf(b > 1, 1, 2)", "c = iif(b, 1, 2)", "d = Nz(b, 0)")

            // Act
            val result = TreeSitterMetrics.parse(code, Language.VBA)

            // Assert
            assertThat(result.logicComplexity).isEqualTo(2.0)
        }
    }

    @Nested
    inner class Functions {
        @Test
        fun `should count subs, functions and property procedures but not declares and events`() {
            // Arrange
            val code = """
                Private Declare PtrSafe Function GetTickCount Lib "kernel32" () As Long
                Public Event Changed()
                Sub A()
                End Sub
                Public Function B() As Long
                End Function
                Property Get C() As Long
                End Property
                Property Let C(ByVal value As Long)
                End Property
                Property Set D(ByVal value As Object)
                End Property
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.VBA)

            // Assert
            assertThat(result.numberOfFunctions).isEqualTo(5.0)
        }

        @Test
        fun `should add one complexity per procedure to its logic complexity`() {
            // Arrange
            val code = """
                Sub A()
                    If a Then b = 1
                End Sub
                Function B() As Long
                End Function
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.VBA)

            // Assert
            assertThat(result.complexity).isEqualTo(3.0)
        }

        @Test
        fun `should take the parameters of the procedure with the most`() {
            // Arrange
            val code = """
                Sub A(ByVal x As Long, Optional y As Long = 0, ParamArray rest() As Variant)
                End Sub
                Function B(z As String) As Long
                End Function
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.VBA)

            // Assert
            assertThat(result.perFunctionMetrics["max_parameters_per_function"]).isEqualTo(3.0)
        }

        @Test
        fun `should count the body lines of a procedure without its Sub and End Sub lines`() {
            // Arrange
            val code = """
                Sub A()
                    Dim x As Long
                    x = 1

                    MsgBox x
                End Sub
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.VBA)

            // Assert
            assertThat(result.perFunctionMetrics["max_rloc_per_function"]).isEqualTo(3.0)
        }
    }

    @Nested
    inner class MessageChains {
        @ParameterizedTest
        @ValueSource(
            strings = [
                "Obj.M1.M2.M3.M4",
                "Obj.M1().M2().M3().M4()",
                "x = Application.CurrentProject.AllForms(\"frmA\").Properties.Item(0).Value",
                "Set rs = CurrentDb.TableDefs(\"t\").Fields(1).Properties.Item(\"p\")"
            ]
        )
        fun `should count a chain of four or more member calls once`(statement: String) {
            // Arrange
            val code = inSub(statement)

            // Act
            val result = TreeSitterMetrics.parse(code, Language.VBA)

            // Assert
            assertThat(result.messageChains).isEqualTo(1.0)
        }

        @ParameterizedTest
        @ValueSource(strings = ["rs.Fields.Item(1).Value = 2", "Forms!frmA!txtB.Value = 1", "DoCmd.OpenForm \"frmA\""])
        fun `should not count a chain of fewer than four member calls`(statement: String) {
            // Arrange
            val code = inSub(statement)

            // Act
            val result = TreeSitterMetrics.parse(code, Language.VBA)

            // Assert
            assertThat(result.messageChains).isEqualTo(0.0)
        }
    }

    @Nested
    inner class LinesAndComments {
        @Test
        fun `should count apostrophe, REM and trailing comments as comment lines`() {
            // Arrange
            val code = """
                ' leading comment
                Rem old style comment
                Sub A()
                    MsgBox "x" ' trailing comment
                End Sub
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.VBA)

            // Assert
            assertThat(result.commentLines).isEqualTo(3.0)
        }

        @Test
        fun `should count the export header as real lines of code`() {
            // Arrange
            val code = """
                VERSION 1.0 CLASS
                BEGIN
                  MultiUse = -1  'True
                END
                Attribute VB_Name = "clsCustomer"
                Option Explicit
                ' a comment

                Sub A()
                End Sub
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.VBA)

            // Assert
            assertThat(result.realLinesOfCode).isEqualTo(8.0)
        }
    }

    @Nested
    inner class Forms {
        @Test
        fun `should measure the code of a VB6 form behind its layout`() {
            // Arrange
            val code = """
                VERSION 5.00
                Begin VB.Form frmMain
                   Caption         =   "Main"
                   Begin VB.CommandButton cmdOk
                      Caption         =   "OK"
                   End
                End
                Attribute VB_Name = "frmMain"
                Private Sub cmdOk_Click()
                    If x > 0 Then Unload Me
                End Sub
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.VB6)

            // Assert
            assertThat(listOf(result.numberOfFunctions, result.complexity, result.realLinesOfCode)).isEqualTo(listOf(1.0, 2.0, 11.0))
        }
    }
}
