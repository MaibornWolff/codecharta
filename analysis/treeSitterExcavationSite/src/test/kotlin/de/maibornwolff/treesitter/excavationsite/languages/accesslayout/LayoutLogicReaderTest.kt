package de.maibornwolff.treesitter.excavationsite.languages.accesslayout

import de.maibornwolff.treesitter.excavationsite.languages.accesslayout.extractors.LayoutLogicReader
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class LayoutLogicReaderTest {
    private val form = """
        Version =20
        VersionRequired =20
        Checksum =262948377
        Begin Form
            RecordSource ="qryOrderList"
            OnOpen ="[Event Procedure]"
            PrtMip = Begin
                0xa0050000a0050000 ,
                0x01000000
            End
            Begin
                Begin TextBox
                    ControlSource ="=Default()"
                End
                Begin FormHeader
                    Begin
                        Begin CommandButton
                            OnClick ="=OpenForm_frmOrderDetails()"
                            GUID = Begin
                                0x3f30430988463641
                            End
                        End
                    End
                End
                Begin Section
                    Begin
                        Begin ComboBox
                            RowSource ="SELECT qryProductDetail.ProductID FROM qryProductD"
                                "etail ORDER BY qryProductDetail.ProductID;"
                            OnDblClick ="=Open_frmCompanyDetail(\"\")"
                        End
                        Begin ComboBox
                            RowSourceType ="Value List"
                            RowSource ="Credit Card;Check;Cash"
                        End
                        Begin Subform
                            SourceObject ="Form.sfrmOrderLineItems"
                            OnClickEmMacro = Begin
                                Version =196611
                                Begin
                                    Action ="OpenReport"
                                    Argument ="rptLearn"
                                End
                            End
                            Begin
                                Begin Label
                                    Caption ="=Lines"
                                End
                            End
                        End
                        Begin TextBox
                            ControlSource ="=Sum([OrderTotal])"
                        End
                    End
                End
            End
        End
        CodeBehindForm
        Attribute VB_GlobalNameSpace = False
        Private Sub Form_Open(Cancel As Integer)
            RecordSource = "=Hidden()"
        End Sub
    """.trimIndent()

    @Test
    fun `should read the expressions of controls and events, and no default style or code behind the form`() {
        // Act
        val logic = LayoutLogicReader.read(form)

        // Assert
        assertThat(logic.expressions).containsExactly(
            "OpenForm_frmOrderDetails()",
            "Open_frmCompanyDetail(\"\")",
            "Sum([OrderTotal])"
        )
    }

    @Test
    fun `should read the SQL of a row source across its lines, and the names of the other data sources`() {
        // Act
        val logic = LayoutLogicReader.read(form)

        // Assert
        assertThat(logic.queries).containsExactly(
            "SELECT qryProductDetail.ProductID FROM qryProductDetail ORDER BY qryProductDetail.ProductID;"
        )
        assertThat(logic.dataSources).containsExactly("qryOrderList")
        assertThat(logic.subforms).containsExactly("sfrmOrderLineItems")
        assertThat(logic.subreports).isEmpty()
    }

    @Test
    fun `should count the lines of logic, and the controls inside the sections`() {
        // Act
        val logic = LayoutLogicReader.read(form)

        // Assert
        assertThat(logic.logicLines).isEqualTo(5)
        assertThat(logic.controls).isEqualTo(6)
        assertThat(logic.lines).isEqualTo(form.lines().indexOf("CodeBehindForm"))
    }

    @Test
    fun `should read a subreport, and a table or query a subform shows`() {
        // Arrange
        val report = """
            Begin Report
                Begin
                    Begin Section
                        Begin
                            Begin Subform
                                SourceObject ="Report.srptShipVia"
                            End
                            Begin Subform
                                SourceObject ="Query.qryShippers"
                            End
                        End
                    End
                End
            End
        """.trimIndent()

        // Act
        val logic = LayoutLogicReader.read(report)

        // Assert
        assertThat(logic.subreports).containsExactly("srptShipVia")
        assertThat(logic.dataSources).containsExactly("qryShippers")
    }
}
