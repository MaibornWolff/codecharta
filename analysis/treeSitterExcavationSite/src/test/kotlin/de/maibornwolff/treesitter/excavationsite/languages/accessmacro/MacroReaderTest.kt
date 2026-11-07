package de.maibornwolff.treesitter.excavationsite.languages.accessmacro

import de.maibornwolff.treesitter.excavationsite.languages.accessmacro.extractors.Macro
import de.maibornwolff.treesitter.excavationsite.languages.accessmacro.extractors.MacroAction
import de.maibornwolff.treesitter.excavationsite.languages.accessmacro.extractors.MacroBranch
import de.maibornwolff.treesitter.excavationsite.languages.accessmacro.extractors.MacroComment
import de.maibornwolff.treesitter.excavationsite.languages.accessmacro.extractors.MacroConditional
import de.maibornwolff.treesitter.excavationsite.languages.accessmacro.extractors.MacroGroup
import de.maibornwolff.treesitter.excavationsite.languages.accessmacro.extractors.MacroReader
import de.maibornwolff.treesitter.excavationsite.languages.accessmacro.extractors.Submacro
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class MacroReaderTest {
    @Test
    fun `should read the statements of the macro from its XML rather than from its action rows`() {
        // Arrange
        val macro = AccessMacroSamples.autoExec

        // Act
        val result = MacroReader.read(macro)

        // Assert
        assertThat(result).isEqualTo(
            Macro(
                listOf(
                    MacroConditional(
                        listOf(
                            MacroBranch(
                                "Not [CurrentProject].[IsTrusted]",
                                listOf(MacroAction("OpenForm", mapOf("FormName" to "frmStartup")))
                            )
                        )
                    ),
                    MacroConditional(
                        listOf(
                            MacroBranch(
                                "[CurrentProject].[IsTrusted]",
                                listOf(MacroAction("RunCode", mapOf("FunctionName" to "Startup()")))
                            )
                        )
                    )
                ),
                emptyList()
            )
        )
    }

    @Test
    fun `should read else branches, groups, comments and submacros from the XML`() {
        // Arrange
        val macro = AccessMacroSamples.saveAsText(
            """
            <UserInterfaceMacro xmlns="http://schemas.microsoft.com/office/accessservices/2009/11/application"><Statements>
            <Comment>Opens the orders</Comment>
            <Group Name="Orders"><Statements><ConditionalBlock>
            <If><Condition>[TempVars]![Admin]</Condition><Statements><Action Name="OpenForm"><Argument Name="FormName">frmAdmin</Argument></Action></Statements></If>
            <ElseIf><Condition>[TempVars]![Guest]</Condition><Statements/></ElseIf>
            <Else><Statements><Action Name="Beep"/></Statements></Else>
            </ConditionalBlock></Statements></Group>
            </Statements>
            <Sub Name="PrintOrders"><Statements><Action Name="OpenReport"><Argument Name="ReportName">rptOrders</Argument></Action></Statements></Sub>
            </UserInterfaceMacro>
            """.trimIndent()
        )

        // Act
        val result = MacroReader.read(macro)

        // Assert
        val conditional = MacroConditional(
            listOf(
                MacroBranch("[TempVars]![Admin]", listOf(MacroAction("OpenForm", mapOf("FormName" to "frmAdmin")))),
                MacroBranch("[TempVars]![Guest]", emptyList()),
                MacroBranch(null, listOf(MacroAction("Beep", emptyMap())))
            )
        )
        assertThat(result.statements).containsExactly(MacroComment("Opens the orders"), MacroGroup("Orders", listOf(conditional)))
        assertThat(result.submacros).containsExactly(
            Submacro("PrintOrders", listOf(MacroAction("OpenReport", mapOf("ReportName" to "rptOrders"))))
        )
    }

    @Test
    fun `should read the action rows of a macro without XML, naming the arguments of the actions it knows`() {
        // Arrange
        val macro = AccessMacroSamples.autoExec
            .lines()
            .filterNot { it.contains("_AXL") || it.trimStart().startsWith("\"") }
            .joinToString("\n")
            .replace(Regex("""Begin\s+End\s*"""), "")

        // Act
        val result = MacroReader.read(macro)

        // Assert
        val openForm = MacroAction("OpenForm", mapOf("FormName" to "frmStartup", "View" to "0", "DataMode" to "-1", "WindowMode" to "0"))
        assertThat(result.statements).containsExactly(
            MacroConditional(listOf(MacroBranch("Not [CurrentProject].[IsTrusted]", listOf(openForm)))),
            MacroConditional(
                listOf(MacroBranch("[CurrentProject].[IsTrusted]", listOf(MacroAction("RunCode", mapOf("FunctionName" to "Startup()")))))
            )
        )
    }

    @Test
    fun `should read a continued condition, a comment row and the submacros of the action rows`() {
        // Arrange
        val macro = """
            Version =196611
            Begin
                Comment ="Opens the orders"
            End
            Begin
                Condition ="[Paid]"
                Action ="OpenForm"
                Argument ="frmOrders"
                Argument ="0"
                Argument =""
                Argument ="[ID]=1"
            End
            Begin
                Condition ="..."
                Action ="Beep"
            End
            Begin
                MacroName ="PrintOrders"
                Action ="Restore"
                Argument ="x"
            End
        """.trimIndent()

        // Act
        val result = MacroReader.read(macro)

        // Assert
        assertThat(result.statements).containsExactly(
            MacroComment("Opens the orders"),
            MacroConditional(
                listOf(
                    MacroBranch(
                        "[Paid]",
                        listOf(
                            MacroAction("OpenForm", mapOf("FormName" to "frmOrders", "View" to "0", "WhereCondition" to "[ID]=1")),
                            MacroAction("Beep", emptyMap())
                        )
                    )
                )
            )
        )
        assertThat(result.submacros).containsExactly(Submacro("PrintOrders", listOf(MacroAction("Restore", mapOf("Argument1" to "x")))))
    }

    @Test
    fun `should read the action rows when the XML is broken`() {
        // Arrange
        val macro = "Begin\n    Action =\"Beep\"\nEnd\nBegin\n    Comment =\"_AXL:<UserInterfaceMacro><Statements>\"\nEnd\n"

        // Act
        val result = MacroReader.read(macro)

        // Assert
        assertThat(result.statements).containsExactly(MacroAction("Beep", emptyMap()))
    }

    @Test
    fun `should read nothing from a text that is no macro`() {
        // Act
        val result = MacroReader.read("Option Explicit\nSub Main()\nEnd Sub\n")

        // Assert
        assertThat(result).isEqualTo(Macro(emptyList(), emptyList()))
    }
}
