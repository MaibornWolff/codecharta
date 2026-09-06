package de.maibornwolff.treesitter.excavationsite.languages.abl

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class AblExtractionTest {
    // === Procedure Definition Identifier Tests ===

    @Test
    fun `should extract procedure definition identifier`() {
        // Arrange
        val code = """
            PROCEDURE processOrder:
                MESSAGE "Processing order".
            END PROCEDURE.
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.ABL)

        // Assert
        assertThat(result.identifiers).containsExactly("processOrder")
        assertThat(result.strings).containsExactly("Processing order")
    }

    @Test
    fun `should extract function definition identifier`() {
        // Arrange
        val code = """
            FUNCTION calculateTotal RETURNS DECIMAL:
                RETURN 100.00.
            END FUNCTION.
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.ABL)

        // Assert
        assertThat(result.identifiers).containsExactly("calculateTotal")
    }

    @Test
    fun `should extract multiple procedure and function identifiers`() {
        // Arrange
        val code = """
            PROCEDURE initializeData:
                MESSAGE "Initializing".
            END PROCEDURE.

            FUNCTION getCustomerName RETURNS CHARACTER:
                RETURN "John".
            END FUNCTION.

            PROCEDURE cleanup:
                MESSAGE "Cleaning up".
            END PROCEDURE.
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.ABL)

        // Assert
        assertThat(result.identifiers).containsExactly("initializeData", "getCustomerName", "cleanup")
        assertThat(result.strings).containsExactly("Initializing", "John", "Cleaning up")
    }

    // === Comment Extraction Tests ===

    @Test
    fun `should extract line comment`() {
        // Arrange
        val code = """
            // This is a line comment
            MESSAGE "Hello".
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.ABL)

        // Assert
        assertThat(result.comments).containsExactly("This is a line comment")
        assertThat(result.strings).containsExactly("Hello")
    }

    @Test
    fun `should extract block comment`() {
        // Arrange
        val code = """
            /* This is a block comment */
            MESSAGE "Hello".
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.ABL)

        // Assert
        assertThat(result.comments).containsExactly("This is a block comment")
        assertThat(result.strings).containsExactly("Hello")
    }

    // === String Extraction Tests ===

    @Test
    fun `should extract double quoted string`() {
        // Arrange
        val code = """MESSAGE "Hello World"."""

        // Act
        val result = TreeSitterExtraction.extract(code, Language.ABL)

        // Assert
        assertThat(result.strings).containsExactly("Hello World")
    }

    @Test
    fun `should extract multiple strings`() {
        // Arrange
        val code = """
            MESSAGE "First message".
            MESSAGE "Second message".
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.ABL)

        // Assert
        assertThat(result.strings).containsExactly("First message", "Second message")
    }

    @Test
    fun `should extract single quoted string`() {
        // Arrange
        val code = """MESSAGE 'Hello World'."""

        // Act
        val result = TreeSitterExtraction.extract(code, Language.ABL)

        // Assert
        assertThat(result.strings).containsExactly("Hello World")
    }

    // === Method and Constructor Identifier Tests ===

    @Test
    fun `should extract method definition identifiers`() {
        // Arrange
        val code = """
            CLASS MyClass:
                METHOD PUBLIC VOID doSomething():
                END METHOD.

                METHOD PUBLIC INTEGER calculate():
                    RETURN 42.
                END METHOD.
            END CLASS.
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.ABL)

        // Assert
        assertThat(result.identifiers).containsExactlyInAnyOrder("MyClass", "doSomething", "calculate")
    }

    @Test
    fun `should extract constructor definition identifier`() {
        // Arrange
        val code = """
            CLASS MyClass:
                CONSTRUCTOR PUBLIC MyClass():
                END CONSTRUCTOR.
            END CLASS.
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.ABL)

        // Assert
        assertThat(result.identifiers).containsExactlyInAnyOrder("MyClass", "MyClass")
    }

    // === Function Parameter Extraction Tests ===

    @Test
    fun `should extract function parameters`() {
        // Arrange
        val code = """
            FUNCTION calculateSum RETURNS INTEGER (
                INPUT piA AS INTEGER,
                INPUT piB AS INTEGER,
                INPUT piC AS INTEGER
            ):
                RETURN piA + piB + piC.
            END FUNCTION.
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.ABL)

        // Assert
        assertThat(result.identifiers).containsExactlyInAnyOrder(
            "calculateSum",
            "piA",
            "piB",
            "piC"
        )
    }

    @Test
    fun `should extract function parameter with single parameter`() {
        // Arrange
        val code = """
            FUNCTION greet RETURNS CHARACTER (
                INPUT pcName AS CHARACTER
            ):
                RETURN "Hello, " + pcName + "!".
            END FUNCTION.
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.ABL)

        // Assert
        assertThat(result.identifiers).containsExactlyInAnyOrder("greet", "pcName")
        assertThat(result.strings).containsExactlyInAnyOrder("Hello, ", "!")
    }

    // === Catch Variable Extraction Tests ===

    @Test
    fun `should extract catch exception variable`() {
        // Arrange
        val code = """
            DO ON ERROR UNDO, THROW:
                RUN someProc.
                CATCH ex AS Progress.Lang.Error:
                    MESSAGE ex:GetMessage(1).
                END CATCH.
            END.
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.ABL)

        // Assert
        assertThat(result.identifiers).containsExactly("ex")
    }

    // === FOR EACH Buffer Extraction Tests ===

    @Test
    fun `should extract FOR EACH buffer names`() {
        // Arrange
        val code = """
            FOR EACH Customer NO-LOCK,
                EACH Order OF Customer NO-LOCK:
                DISPLAY Customer.Name Order.Total.
            END.
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.ABL)

        // Assert
        assertThat(result.identifiers).containsExactlyInAnyOrder("Customer", "Order")
    }

    // === Interface Definition Tests ===

    @Test
    fun `should extract interface definition identifier`() {
        // Arrange
        val code = """
            INTERFACE ICustomer:
                METHOD PUBLIC CHARACTER GetName().
                METHOD PUBLIC VOID SetName(INPUT pcName AS CHARACTER).
            END INTERFACE.
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.ABL)

        // Assert
        // ICustomer (interface name), GetName/SetName (method names), pcName (parameter)
        // CHARACTER is a type, not extracted
        assertThat(result.identifiers).containsExactlyInAnyOrder(
            "ICustomer",
            "GetName",
            "SetName",
            "pcName"
        )
    }

    // === Empty Code Tests ===

    @Test
    fun `should handle empty source code`() {
        // Arrange
        val code = ""

        // Act
        val result = TreeSitterExtraction.extract(code, Language.ABL)

        // Assert
        assertThat(result.identifiers).isEmpty()
        assertThat(result.comments).isEmpty()
        assertThat(result.strings).isEmpty()
    }

    // === Property Definition Tests ===

    @Test
    fun `should extract property definition identifiers`() {
        // Arrange
        val code = """
            CLASS MyClass:
                DEFINE PUBLIC PROPERTY CustomerName AS CHARACTER NO-UNDO
                    GET.
                    SET.
            END CLASS.
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.ABL)

        // Assert
        assertThat(result.identifiers).containsExactlyInAnyOrder("MyClass", "CustomerName")
    }

    @Test
    fun `should extract multiple property definitions`() {
        // Arrange
        val code = """
            CLASS Customer:
                DEFINE PUBLIC PROPERTY Name AS CHARACTER NO-UNDO
                    GET.
                    SET.
                DEFINE PUBLIC PROPERTY Age AS INTEGER NO-UNDO
                    GET.
                    SET.
            END CLASS.
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.ABL)

        // Assert
        assertThat(result.identifiers).containsExactlyInAnyOrder("Customer", "Name", "Age")
    }

    // === Enum Definition Tests ===

    @Test
    fun `should extract enum definition identifiers`() {
        // Arrange
        val code = """
            ENUM OrderStatus:
                DEFINE ENUM Pending.
                DEFINE ENUM Processing.
                DEFINE ENUM Completed.
            END ENUM.
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.ABL)

        // Assert
        assertThat(result.identifiers).containsExactlyInAnyOrder(
            "OrderStatus",
            "Pending",
            "Processing",
            "Completed"
        )
    }

    // === Variable Definition Tests ===

    @Test
    fun `should extract variable definition identifiers`() {
        // Arrange
        val code = """
            DEFINE VARIABLE iCounter AS INTEGER NO-UNDO.
            DEFINE VARIABLE cName AS CHARACTER INITIAL "test" NO-UNDO.
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.ABL)

        // Assert
        assertThat(result.identifiers).containsExactlyInAnyOrder("iCounter", "cName")
        assertThat(result.strings).containsExactly("test")
    }

    // === API Tests ===

    @Test
    fun `should report extraction is supported for ABL`() {
        // Act & Assert
        assertThat(TreeSitterExtraction.isExtractionSupported(Language.ABL)).isTrue()
        assertThat(TreeSitterExtraction.isExtractionSupported(".p")).isTrue()
        assertThat(TreeSitterExtraction.isExtractionSupported(".cls")).isTrue()
        assertThat(TreeSitterExtraction.isExtractionSupported(".w")).isTrue()
    }

    @Test
    fun `should return ABL in supported languages`() {
        // Act & Assert
        assertThat(TreeSitterExtraction.isExtractionSupported(Language.ABL)).isTrue()
    }

    @Test
    fun `should return ABL extensions in supported extensions`() {
        // Act & Assert
        assertThat(TreeSitterExtraction.isExtractionSupported(".p")).isTrue()
        assertThat(TreeSitterExtraction.isExtractionSupported(".cls")).isTrue()
        assertThat(TreeSitterExtraction.isExtractionSupported(".w")).isTrue()
    }
}
