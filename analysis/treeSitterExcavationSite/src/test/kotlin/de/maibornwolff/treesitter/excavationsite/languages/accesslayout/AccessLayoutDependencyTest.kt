package de.maibornwolff.treesitter.excavationsite.languages.accesslayout

import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import de.maibornwolff.treesitter.excavationsite.api.VbaName
import de.maibornwolff.treesitter.excavationsite.api.VbaNameKind
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class AccessLayoutDependencyTest {
    private val form = """
        Begin Form
            RecordSource ="qryOrderList"
            OnOpen ="[Event Procedure]"
            Begin
                Begin Section
                    Begin
                        Begin CommandButton
                            OnClick ="=OpenForm_frmOrderDetails()"
                        End
                        Begin TextBox
                            ControlSource ="=DLookup(\"Rate\",\"qryTaxRates\",\"ID=1\") * modMath.Rounded([Total])"
                        End
                        Begin TextBox
                            DefaultValue ="=[Forms]![frmLogin]![cboEmployee]"
                        End
                        Begin ComboBox
                            RowSource ="SELECT Companies.CompanyName FROM Companies WHERE Companies.TypeID = [Forms]![frmFilter]![cboType];"
                        End
                        Begin Subform
                            SourceObject ="Form.sfrmOrderLines"
                        End
                        Begin Subform
                            SourceObject ="Report.srptShipVia"
                        End
                    End
                End
            End
        End
    """.trimIndent()

    @Test
    fun `should read the data sources, subforms and what the expressions name, without the routine of the expressions`() {
        // Act
        val layout = TreeSitterDependencies.accessLayout(form)

        // Assert
        assertThat(layout.names).containsExactly(
            VbaName(listOf("qryOrderList"), VbaNameKind.RELATION),
            VbaName(listOf("sfrmOrderLines"), VbaNameKind.FORM),
            VbaName(listOf("srptShipVia"), VbaNameKind.REPORT),
            VbaName(listOf("OpenForm_frmOrderDetails")),
            VbaName(listOf("qryTaxRates"), VbaNameKind.RELATION),
            VbaName(listOf("modMath", "Rounded")),
            VbaName(listOf("frmLogin"), VbaNameKind.FORM)
        )
    }

    @Test
    fun `should read the SQL of a row source as an Access query, and that it binds an event procedure`() {
        // Act
        val layout = TreeSitterDependencies.accessLayout(form)

        // Assert
        assertThat(layout.queries.map { it.forms }).containsExactly(listOf("frmFilter"))
        assertThat(layout.bindsEventProcedure).isTrue()
    }

    @Test
    fun `should read a layout without any event procedure as one that binds none`() {
        // Act
        val layout = TreeSitterDependencies.accessLayout("Begin Report\n    OnOpen =\"=Start()\"\nEnd\n")

        // Assert
        assertThat(layout.bindsEventProcedure).isFalse()
        assertThat(layout.names).containsExactly(VbaName(listOf("Start")))
    }

    @Test
    fun `should read the macro an event names and what an embedded macro names`() {
        // Arrange
        val report = """
            Begin Report
                OnOpen ="mcrReports.Open"
                OnNoData ="[Embedded Macro]"
                Begin
                    Begin Section
                        Begin
                            Begin CommandButton
                                OnClickEmMacro = Begin
                                    Version =196611
                                    Begin
                                        Action ="OpenForm"
                                        Argument ="frmOrders"
                                    End
                                End
                            End
                        End
                    End
                End
            End
        """.trimIndent()

        // Act
        val layout = TreeSitterDependencies.accessLayout(report)

        // Assert
        assertThat(layout.names).containsExactly(
            VbaName(listOf("mcrReports.Open"), VbaNameKind.MACRO),
            VbaName(listOf("frmOrders"), VbaNameKind.FORM)
        )
    }
}
