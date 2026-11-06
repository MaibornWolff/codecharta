package de.maibornwolff.treesitter.excavationsite.languages.accesslayout

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterMetrics
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class AccessLayoutMetricsTest {
    private val form = """
        Version =20
        Begin Form
            RecordSource ="qryOrderList"
            OnOpen ="[Event Procedure]"
            Begin
                Begin Section
                    Begin
                        Begin TextBox
                            ControlSource ="=IIf([Paid] And [Shipped],\"Done\",\"Open\")"
                        End
                        Begin ComboBox
                            RowSource ="SELECT Products.ProductID FROM Products WHERE Products.Discontinued = False Or "
                                "Products.Stock > 0;"
                        End
                        Begin Label
                            Caption ="Status"
                        End
                    End
                End
            End
        End
        CodeBehindForm
        Private Sub Form_Open(Cancel As Integer)
            If Cancel Then Exit Sub
        End Sub
    """.trimIndent()

    @Test
    fun `should count the lines of the expressions and the SQL as its real lines of code, and no routine`() {
        // Act
        val result = TreeSitterMetrics.parse(form, Language.ACCESS_LAYOUT)

        // Assert
        assertThat(result.realLinesOfCode).isEqualTo(3.0)
        assertThat(result.numberOfFunctions).isEqualTo(0.0)
        assertThat(result.linesOfCode).isEqualTo(form.lines().indexOf("CodeBehindForm").toDouble())
    }

    @Test
    fun `should count the decisions of the expressions and the SQL, and no decision of the code behind the form`() {
        // Act
        val result = TreeSitterMetrics.parse(form, Language.ACCESS_LAYOUT)

        // Assert
        assertThat(result.logicComplexity).isEqualTo(3.0)
        assertThat(result.complexity).isEqualTo(3.0)
    }

    @Test
    fun `should count the controls of the sections`() {
        // Act
        val result = TreeSitterMetrics.parse(form, Language.ACCESS_LAYOUT)

        // Assert
        assertThat(result.numberOfControls).isEqualTo(3.0)
    }

    @Test
    fun `should report a layout without code as one without lines of code`() {
        // Arrange
        val report = "Begin Report\n    Caption =\"Empty\"\nEnd\n"

        // Act
        val result = TreeSitterMetrics.parse(report, Language.ACCESS_LAYOUT)

        // Assert
        assertThat(result.realLinesOfCode).isEqualTo(0.0)
        assertThat(result.complexity).isEqualTo(0.0)
        assertThat(result.numberOfControls).isEqualTo(0.0)
    }
}
