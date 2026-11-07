package de.maibornwolff.treesitter.excavationsite.languages.accesslayout

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class AccessLayoutExtractionTest {
    private val report = """
        Begin Report
            Caption ="Sales by \"Region\""
            Begin
                Begin Label
                    Caption ="Style"
                End
                Begin Section
                    Begin
                        Begin TextBox
                            Name ="txtRegion"
                            ControlSource ="RegionName"
                        End
                        Begin TextBox
                            Name ="txtTotal"
                            ControlSource ="=Sum([Amount])"
                        End
                        Begin ComboBox
                            Name ="cboPayment"
                            RowSourceType ="Value List"
                            RowSource ="Card;Cash"
                        End
                    End
                End
            End
        End
    """.trimIndent()

    @Test
    fun `should extract the names of the controls and the fields they show, and the one-letter routine of the expressions`() {
        // Act
        val result = TreeSitterExtraction.extract(report, Language.ACCESS_LAYOUT)

        // Assert
        assertThat(result.identifiers).containsExactly("txtRegion", "RegionName", "txtTotal", "cboPayment", "L")
    }

    @Test
    fun `should extract the captions as strings, unescaped, and no caption of a default style`() {
        // Act
        val result = TreeSitterExtraction.extract(report, Language.ACCESS_LAYOUT)

        // Assert
        assertThat(result.strings).containsExactly("Sales by \"Region\"")
    }

    @Test
    fun `should leave out the names Access gives a control by default, a control type and a number`() {
        // Arrange
        val form = """
            Begin Form
                Begin
                    Begin Section
                        Begin
                            Begin Label
                                Name ="Label122"
                            End
                            Begin Image
                                Name ="Auto_Header0"
                            End
                            Begin TextBox
                                Name ="Text45"
                            End
                            Begin Label
                                Name ="lblInvoice2"
                            End
                            Begin Rectangle
                                Name ="BoxShadow"
                            End
                        End
                    End
                End
            End
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(form, Language.ACCESS_LAYOUT)

        // Assert
        assertThat(result.identifiers).containsExactly("lblInvoice2", "BoxShadow")
    }

    @Test
    fun `should extract the texts of an embedded macro`() {
        // Arrange
        val form = """
            Begin Form
                Begin
                    Begin Section
                        Begin
                            Begin CommandButton
                                Name ="cmdPrint"
                                OnClickEmMacro = Begin
                                    Version =196611
                                    Begin
                                        Action ="MsgBox"
                                        Argument ="Printing the invoice"
                                    End
                                    Begin
                                        Action ="OpenReport"
                                        Argument ="rptInvoice"
                                    End
                                End
                            End
                        End
                    End
                End
            End
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(form, Language.ACCESS_LAYOUT)

        // Assert
        assertThat(result.identifiers).containsExactly("cmdPrint", "rptInvoice")
        assertThat(result.strings).containsExactly("Printing the invoice")
    }
}
