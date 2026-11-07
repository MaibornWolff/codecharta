package de.maibornwolff.treesitter.excavationsite.languages.accessmacro

import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import de.maibornwolff.treesitter.excavationsite.api.VbaName
import de.maibornwolff.treesitter.excavationsite.api.VbaNameKind
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class AccessMacroDependencyTest {
    @Test
    fun `should read the form a macro opens and the function it runs`() {
        // Act
        val macro = TreeSitterDependencies.accessMacro(AccessMacroSamples.autoExec)

        // Assert
        assertThat(macro.names).containsExactly(VbaName(listOf("frmStartup"), VbaNameKind.FORM), VbaName(listOf("Startup")))
    }

    @Test
    fun `should read the objects its actions name, in submacros too, and what its expressions name`() {
        // Arrange
        val macro = AccessMacroSamples.saveAsText(
            """
            <UserInterfaceMacro xmlns="http://schemas.microsoft.com/office/accessservices/2009/11/application"><Statements>
            <Action Name="OnError"><Argument Name="Goto">Macro Name</Argument><Argument Name="MacroName">Failed</Argument></Action>
            <ConditionalBlock><If><Condition>[Forms]![frmLogin]![cboEmployee] &gt; 0</Condition><Statements>
            <Action Name="OpenReport"><Argument Name="ReportName">rptSales</Argument><Argument Name="FilterName">qryThisYear</Argument></Action>
            </Statements></If></ConditionalBlock>
            <Action Name="OpenQuery"><Argument Name="QueryName">qryUpdatePrices</Argument></Action>
            <Action Name="CloseWindow"><Argument Name="ObjectType">Form</Argument><Argument Name="ObjectName">frmLogin</Argument></Action>
            </Statements>
            <Sub Name="Failed"><Statements>
            <Action Name="RunMacro"><Argument Name="MacroName">mcrLog.Write</Argument></Action>
            <Action Name="SetTempVar"><Argument Name="Name">Total</Argument><Argument Name="Expression">modMath.Rounded([Total])</Argument></Action>
            </Statements></Sub>
            </UserInterfaceMacro>
            """.trimIndent()
        )

        // Act
        val result = TreeSitterDependencies.accessMacro(macro)

        // Assert
        assertThat(result.names).containsExactly(
            VbaName(listOf("rptSales"), VbaNameKind.REPORT),
            VbaName(listOf("qryThisYear"), VbaNameKind.RELATION),
            VbaName(listOf("qryUpdatePrices"), VbaNameKind.RELATION),
            VbaName(listOf("frmLogin"), VbaNameKind.FORM),
            VbaName(listOf("mcrLog.Write"), VbaNameKind.MACRO),
            VbaName(listOf("frmLogin"), VbaNameKind.FORM),
            VbaName(listOf("modMath", "Rounded"))
        )
    }
}
