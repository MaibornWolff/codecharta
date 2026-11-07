package de.maibornwolff.treesitter.excavationsite.languages.accessmacro

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class AccessMacroExtractionTest {
    private val macro = AccessMacroSamples.saveAsText(
        """
        <UserInterfaceMacro xmlns="http://schemas.microsoft.com/office/accessservices/2009/11/application"><Statements>
        <Comment>Opens the orders</Comment>
        <Group Name="Shipping"><Statements>
        <ConditionalBlock><If><Condition>[TempVars]![Customer] = "Contoso"</Condition><Statements>
        <Action Name="OpenForm"><Argument Name="FormName">frmInvoices</Argument><Argument Name="View">Print Preview</Argument></Action>
        </Statements></If></ConditionalBlock>
        <Action Name="MessageBox"><Argument Name="Message">Invoices printed</Argument><Argument Name="Title">Billing</Argument><Argument Name="Type">Information</Argument></Action>
        </Statements></Group>
        </Statements>
        <Sub Name="Archive"><Statements><Action Name="RunCode"><Argument Name="FunctionName">ArchiveOrders()</Argument></Action></Statements></Sub>
        </UserInterfaceMacro>
        """.trimIndent()
    )

    @Test
    fun `should extract the names of the submacros, groups and objects, and the one-letter routine of the expressions, as identifiers`() {
        // Act
        val result = TreeSitterExtraction.extract(macro, Language.ACCESS_MACRO)

        // Assert
        assertThat(result.identifiers).containsExactly("Archive", "Shipping", "frmInvoices", "L", "L")
    }

    @Test
    fun `should extract the messages, their titles and the strings of its expressions as strings`() {
        // Act
        val result = TreeSitterExtraction.extract(macro, Language.ACCESS_MACRO)

        // Assert
        assertThat(result.strings).containsExactlyInAnyOrder("Invoices printed", "Billing", "Contoso")
    }

    @Test
    fun `should extract its comments`() {
        // Act
        val result = TreeSitterExtraction.extract(macro, Language.ACCESS_MACRO)

        // Assert
        assertThat(result.comments).containsExactly("Opens the orders")
    }
}
