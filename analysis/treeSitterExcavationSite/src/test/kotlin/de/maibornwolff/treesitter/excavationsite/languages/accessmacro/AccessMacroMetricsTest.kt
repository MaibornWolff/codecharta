package de.maibornwolff.treesitter.excavationsite.languages.accessmacro

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterMetrics
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class AccessMacroMetricsTest {
    private val macro = AccessMacroSamples.saveAsText(
        """
        <UserInterfaceMacro xmlns="http://schemas.microsoft.com/office/accessservices/2009/11/application"><Statements>
        <Comment>Opens the orders&#13;&#10;of today</Comment>
        <Action Name="OnError"><Argument Name="Goto">Macro Name</Argument><Argument Name="MacroName">Failed</Argument></Action>
        <ConditionalBlock>
        <If><Condition>[TempVars]![Admin] And Not [TempVars]![Guest]</Condition><Statements><Action Name="OpenForm"><Argument Name="FormName">frmAdmin</Argument></Action></Statements></If>
        <ElseIf><Condition>[TempVars]![Guest]</Condition><Statements><Action Name="SetTempVar"><Argument Name="Name">Mode</Argument><Argument Name="Expression">IIf([Paid],1,2)</Argument></Action></Statements></ElseIf>
        <Else><Statements><Action Name="Beep"/></Statements></Else>
        </ConditionalBlock>
        </Statements>
        <Sub Name="Failed"><Statements><Action Name="MessageBox"><Argument Name="Message">=IIf([Paid] Or [Shipped],"Late","Open")</Argument></Action><Action Name="StopMacro"/></Statements></Sub>
        <Sub Name="Close"><Statements><Action Name="CloseWindow"/></Statements></Sub>
        </UserInterfaceMacro>
        """.trimIndent()
    )

    @Test
    fun `should count the actions and conditions as real lines of code, and the lines of the comments as comment lines`() {
        // Act
        val result = TreeSitterMetrics.parse(macro, Language.ACCESS_MACRO)

        // Assert
        assertThat(result.realLinesOfCode).isEqualTo(9.0)
        assertThat(result.commentLines).isEqualTo(2.0)
        assertThat(result.linesOfCode).isEqualTo(macro.trimEnd().lines().size.toDouble())
    }

    @Test
    fun `should count the branches, the logical operators, IIf and the error handler as decisions`() {
        // Act
        val result = TreeSitterMetrics.parse(macro, Language.ACCESS_MACRO)

        // Assert
        assertThat(result.logicComplexity).isEqualTo(7.0)
        assertThat(result.complexity).isEqualTo(9.0)
    }

    @Test
    fun `should report each submacro as a function`() {
        // Act
        val result = TreeSitterMetrics.parse(macro, Language.ACCESS_MACRO)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(2.0)
        assertThat(result.perFunctionMetrics["max_complexity_per_function"]).isEqualTo(2.0)
        assertThat(result.perFunctionMetrics["min_rloc_per_function"]).isEqualTo(1.0)
        assertThat(result.perFunctionMetrics["max_rloc_per_function"]).isEqualTo(2.0)
        assertThat(result.perFunctionMetrics["max_parameters_per_function"]).isEqualTo(0.0)
    }

    @Test
    fun `should measure the action rows of a macro without XML`() {
        // Arrange
        val rows = "Version =196611\nBegin\n    Condition =\"[Paid] Or [Shipped]\"\n    Action =\"Beep\"\nEnd\n"

        // Act
        val result = TreeSitterMetrics.parse(rows, Language.ACCESS_MACRO)

        // Assert
        assertThat(result.realLinesOfCode).isEqualTo(2.0)
        assertThat(result.complexity).isEqualTo(2.0)
        assertThat(result.numberOfFunctions).isEqualTo(0.0)
    }
}
