package de.maibornwolff.treesitter.excavationsite.languages.abl

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterMetrics
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class AblMetricsTest {
    @Test
    fun `should count if statement for complexity`() {
        // Arrange
        val code = """
            IF customerName = "John" THEN
                MESSAGE "Hello John".
            END.
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.ABL)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count case statement for complexity`() {
        // Arrange
        val code = """
            CASE orderStatus:
                WHEN "pending" THEN MESSAGE "Order pending".
                WHEN "shipped" THEN MESSAGE "Order shipped".
                OTHERWISE MESSAGE "Unknown status".
            END CASE.
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.ABL)

        // Assert
        // CASE (1) + 2 WHEN branches (2) + OTHERWISE (1) = 4
        assertThat(result.complexity).isEqualTo(4.0)
    }

    @Test
    fun `should count repeat statement for complexity`() {
        // Arrange
        val code = """
            REPEAT:
                MESSAGE "Processing...".
                LEAVE.
            END.
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.ABL)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count for each statement for complexity`() {
        // Arrange
        val code = """
            FOR EACH Customer NO-LOCK:
                DISPLAY Customer.Name.
            END.
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.ABL)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count do block for complexity`() {
        // Arrange
        val code = """
            DO WHILE i < 10:
                i = i + 1.
            END.
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.ABL)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count procedure definition for complexity`() {
        // Arrange
        val code = """
            PROCEDURE processOrder:
                MESSAGE "Processing order".
            END PROCEDURE.
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.ABL)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count function definition for complexity`() {
        // Arrange
        val code = """
            FUNCTION calculateTotal RETURNS DECIMAL:
                RETURN 100.00.
            END FUNCTION.
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.ABL)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count comment lines`() {
        // Arrange
        val code = """
            // This is a line comment
            /* This is a
               block comment */
            MESSAGE "Hello".
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.ABL)

        // Assert
        // 1 line comment + 2 lines in block comment = 3 comment lines
        assertThat(result.commentLines).isEqualTo(3.0)
    }

    @Test
    fun `should count procedures and functions for number of functions`() {
        // Arrange
        val code = """
            PROCEDURE processOrder:
                MESSAGE "Processing".
            END PROCEDURE.

            FUNCTION calculateTotal RETURNS DECIMAL:
                RETURN 100.00.
            END FUNCTION.
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.ABL)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(2.0)
    }

    @Test
    fun `should calculate lines of code`() {
        // Arrange
        val code = """
            DEFINE VARIABLE x AS INTEGER NO-UNDO.
            x = 10.
            MESSAGE x.
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.ABL)

        // Assert
        assertThat(result.linesOfCode).isEqualTo(3.0)
    }

    @Test
    fun `should calculate real lines of code excluding comments`() {
        // Arrange
        val code = """
            // Comment
            DEFINE VARIABLE x AS INTEGER NO-UNDO.
            x = 10.
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.ABL)

        // Assert
        // LOC = 3, Comment lines = 1, RLOC = 2 (lines with code, excluding comment line)
        assertThat(result.realLinesOfCode).isEqualTo(2.0)
    }

    @Test
    fun `should handle complex procedure with multiple control structures`() {
        // Arrange
        val code = """
            PROCEDURE complexLogic:
                DEFINE VARIABLE i AS INTEGER NO-UNDO.

                IF i > 0 THEN DO:
                    FOR EACH Customer NO-LOCK:
                        CASE Customer.Status:
                            WHEN "active" THEN MESSAGE "Active".
                            WHEN "inactive" THEN MESSAGE "Inactive".
                        END CASE.
                    END.
                END.
            END PROCEDURE.
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.ABL)

        // Assert
        // Procedure (1) + IF (1) + DO block (1) + FOR EACH (1) + CASE (1) + 2 WHEN branches (2) = 7
        assertThat(result.complexity).isEqualTo(7.0)
    }

    @Test
    fun `should count conditional expression for complexity`() {
        // Arrange
        val code = """
            DEFINE VARIABLE x AS INTEGER NO-UNDO.
            DEFINE VARIABLE y AS INTEGER NO-UNDO.
            DEFINE VARIABLE result AS INTEGER NO-UNDO.

            result = (IF x > y THEN x ELSE y).
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.ABL)

        // Assert
        // conditional_expression counts as 1 complexity
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count methods and constructors for number of functions`() {
        // Arrange
        val code = """
            CLASS MyClass:
                CONSTRUCTOR PUBLIC MyClass():
                    /* init */
                END CONSTRUCTOR.

                METHOD PUBLIC VOID doSomething():
                    /* work */
                END METHOD.

                METHOD PUBLIC INTEGER calculate():
                    RETURN 42.
                END METHOD.
            END CLASS.
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.ABL)

        // Assert
        // 1 constructor + 2 methods = 3 functions
        assertThat(result.numberOfFunctions).isEqualTo(3.0)
    }

    @Test
    fun `should not count single method calls as message chains`() {
        // Arrange
        // Message chains require 4+ consecutive chained calls (a:b():c():d():e())
        // Single method calls like oConfig:GetString() are not chains
        val code = """
            DEFINE VARIABLE oConfig AS CLASS Progress.Json.ObjectModel.JsonObject NO-UNDO.
            DEFINE VARIABLE cValue AS CHARACTER NO-UNDO.
            cValue = oConfig:GetString("key").
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.ABL)

        // Assert
        assertThat(result.messageChains).isEqualTo(0.0)
    }

    @Test
    fun `should not count property access as message chains`() {
        // Arrange
        // Property/field access like Customer.Name or Customer.Status
        // are not method chains
        val code = """
            FOR EACH Customer NO-LOCK:
                IF Customer.Status = "active" THEN
                    DISPLAY Customer.Name.
            END.
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.ABL)

        // Assert
        assertThat(result.messageChains).isEqualTo(0.0)
    }

    @Test
    fun `should count otherwise clause for complexity`() {
        // Arrange
        val code = """
            CASE orderType:
                WHEN 1 THEN MESSAGE "One".
                WHEN 2 THEN MESSAGE "Two".
                OTHERWISE MESSAGE "Other".
            END CASE.
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.ABL)

        // Assert
        // CASE (1) + 2 WHEN branches (2) + OTHERWISE (1) = 4
        assertThat(result.complexity).isEqualTo(4.0)
    }

    @Test
    fun `should recognize i extension as ABL include file`() {
        // Arrange - .i files are ABL include files containing reusable code

        // Act
        val language = Language.fromExtension(".i")

        // Assert
        assertThat(language).isEqualTo(Language.ABL)
    }

    @Test
    fun `should parse ABL include file content`() {
        // Arrange - typical .i file content with variable definitions and procedures
        val code = """
            /* Common definitions include file */
            DEFINE VARIABLE cCustomerId AS CHARACTER NO-UNDO.
            DEFINE VARIABLE iOrderCount AS INTEGER NO-UNDO INITIAL 0.

            PROCEDURE validateCustomer:
                DEFINE INPUT PARAMETER pcId AS CHARACTER NO-UNDO.
                IF pcId = "" THEN
                    RETURN ERROR "Invalid customer ID".
            END PROCEDURE.
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.ABL)

        // Assert
        assertThat(result.linesOfCode).isEqualTo(9.0)
        assertThat(result.numberOfFunctions).isEqualTo(1.0) // 1 procedure
        assertThat(result.complexity).isEqualTo(2.0) // procedure + if
    }
}
