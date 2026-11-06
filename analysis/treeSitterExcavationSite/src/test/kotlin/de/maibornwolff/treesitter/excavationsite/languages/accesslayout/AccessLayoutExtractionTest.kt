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
}
