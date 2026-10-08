package de.maibornwolff.treesitter.excavationsite.languages.php

import de.maibornwolff.treesitter.excavationsite.api.Declaration
import de.maibornwolff.treesitter.excavationsite.api.DeclarationType
import de.maibornwolff.treesitter.excavationsite.api.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.api.ImportKind
import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import de.maibornwolff.treesitter.excavationsite.api.TypeUsage
import de.maibornwolff.treesitter.excavationsite.api.UsedType
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.tuple
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class PhpDependencyTest {
    private fun analyze(code: String) = TreeSitterDependencies.analyze("<?php\n$code", Language.PHP)

    private fun usedTypesOf(code: String, declarationName: String): Set<UsedType> =
        analyze(code).declarations.first { it.name == declarationName }.usedTypes

    private fun importPathsOf(code: String): List<List<String>> = analyze(code).imports.map { it.path }

    @Nested
    inner class ApiSupportCheck {
        @Test
        fun `should report PHP as dependency-supported`() {
            // Arrange & Act
            val supported = TreeSitterDependencies.isDependencyAnalysisSupported(Language.PHP)

            // Assert
            assertThat(supported).isTrue()
        }
    }

    @Nested
    inner class PackageExtraction {
        @Test
        fun `should extract the namespace split at the separators`() {
            // Arrange
            val code = "namespace App\\Http\\Controllers;"

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.packagePath).containsExactly("App", "Http", "Controllers")
        }

        @Test
        fun `should return an empty package path for a file without a namespace`() {
            // Arrange
            val code = "use App\\Models\\Order;\nclass Controller {}"

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.packagePath).isEmpty()
        }

        @Test
        fun `should take the first qualified name of the file for a namespace without a name`() {
            // Arrange
            val code = "namespace {\n    use App\\Models\\Order;\n}"

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.packagePath).containsExactly("App", "Models")
        }
    }

    @Nested
    inner class ImportExtraction {
        @Test
        fun `should extract a use clause with a qualified name`() {
            // Arrange
            val code = "use App\\Models\\Order;"

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.imports).containsExactly(ImportDeclaration(path = listOf("App", "Models", "Order"), isWildcard = false))
        }

        @Test
        fun `should not extract a use clause with a plain name`() {
            // Arrange
            val code = "use Countable;"

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.imports).isEmpty()
        }

        @Test
        fun `should extract an aliased clause as written and without its alias`() {
            // Arrange
            val code = "use App\\Models\\Order as Purchase;"

            // Act
            val paths = importPathsOf(code)

            // Assert
            assertThat(paths).containsExactly(listOf("App", "Models", "Order as Purchase"), listOf("App", "Models", "Order"))
        }

        @Test
        fun `should prefix every member of a group and extract its qualified members without the prefix as well`() {
            // Arrange
            val code = "use App\\Models\\{Order, Billing\\Invoice};"

            // Act
            val paths = importPathsOf(code)

            // Assert
            assertThat(paths).containsExactly(
                listOf("Billing", "Invoice"),
                listOf("App", "Models", "Order"),
                listOf("App", "Models", "Billing\\Invoice")
            )
        }

        @Test
        fun `should extract an imported constant with the keyword and, after all other imports, without it`() {
            // Arrange
            val code = "use const App\\Limits\\MAXIMUM;\nuse App\\Models\\Order;"

            // Act
            val paths = importPathsOf(code)

            // Assert
            assertThat(paths).containsExactly(
                listOf("const App", "Limits", "MAXIMUM"),
                listOf("App", "Models", "Order"),
                listOf("App", "Limits", "MAXIMUM")
            )
        }

        @Test
        fun `should extract an include of a single-quoted path split at the slashes`() {
            // Arrange
            val code = "require_once './lib/helpers.php';\ninclude '..\\shared\\config.php';"

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.imports).containsExactly(
                ImportDeclaration(path = listOf(".", "lib", "helpers.php"), isWildcard = false, kind = ImportKind.INCLUDE),
                ImportDeclaration(path = listOf("..", "shared", "config.php"), isWildcard = false, kind = ImportKind.INCLUDE)
            )
        }

        @Test
        fun `should not extract an include of a double-quoted or computed path`() {
            // Arrange
            val code = "require \"lib/helpers.php\";\nrequire_once __DIR__ . '/config.php';\nrequire('lib/other.php');"

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.imports).isEmpty()
        }
    }

    @Nested
    inner class DeclarationExtraction {
        @Test
        fun `should extract the declarations grouped by kind`() {
            // Arrange
            val code = """
                const LIMIT = 10;
                define('VERSION', '1.0');
                enum Status {}
                interface Payable {}
                function total() {}
                trait Auditable {}
                class Order {}
            """.trimIndent()

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.declarations).extracting({ it.name }, { it.type }).containsExactly(
                tuple("Order", DeclarationType.CLASS),
                tuple("Auditable", DeclarationType.CLASS),
                tuple("total", DeclarationType.FUNCTION),
                tuple("Payable", DeclarationType.INTERFACE),
                tuple("Status", DeclarationType.ENUM),
                tuple("LIMIT", DeclarationType.VARIABLE),
                tuple("VERSION", DeclarationType.VARIABLE)
            )
        }

        @Test
        fun `should not extract a method as a function`() {
            // Arrange
            val code = "class Order {\n    function total() {}\n}"

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.declarations.map { it.name }).containsExactly("Order")
        }

        @Test
        fun `should extract a function declared inside a function as well`() {
            // Arrange
            val code = "function outer() {\n    function inner() {}\n}"

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.declarations.map { it.name }).containsExactly("outer", "inner")
        }

        @Test
        fun `should extract a constant that is the value of a const as a declaration as well`() {
            // Arrange
            val code = "const LIMIT = MAXIMUM;"

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.declarations.map { it.name }).containsExactly("LIMIT", "MAXIMUM")
        }

        @Test
        fun `should not extract a class constant`() {
            // Arrange
            val code = "class Order {\n    const LIMIT = 10;\n}"

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.declarations.map { it.name }).containsExactly("Order")
        }

        @Test
        fun `should extract one unnamed script for a file without declarations`() {
            // Arrange
            val code = "echo (new Report())->render();"

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.declarations).containsExactly(
                Declaration(
                    name = "",
                    type = DeclarationType.SCRIPT,
                    usedTypes = setOf(UsedType("Report", usage = TypeUsage.INSTANTIATION))
                )
            )
        }
    }

    @Nested
    inner class UsedTypeExtraction {
        @Test
        fun `should extract the used types of a class by kind of usage in a fixed order`() {
            // Arrange
            val code = """
                class Order extends Entity implements Payable, Countable {
                    use Auditable;
                    public Money ${'$'}total;
                    public ?Customer ${'$'}customer;
                    function pay(Gateway ${'$'}gateway): Receipt {
                        Logger::info(Status::PAID);
                        return new Invoice();
                    }
                }
            """.trimIndent()

            // Act
            val usedTypes = usedTypesOf(code, "Order")

            // Assert
            assertThat(usedTypes).containsExactly(
                UsedType("Entity", usage = TypeUsage.INHERITANCE),
                UsedType("Payable", usage = TypeUsage.IMPLEMENTATION),
                UsedType("Countable", usage = TypeUsage.IMPLEMENTATION),
                UsedType("Status", usage = TypeUsage.CONSTANT_ACCESS),
                UsedType("Receipt", usage = TypeUsage.RETURN_VALUE),
                UsedType("Gateway", usage = TypeUsage.ARGUMENT),
                UsedType("Invoice", usage = TypeUsage.INSTANTIATION),
                UsedType("Money"),
                UsedType("Customer"),
                UsedType("Logger"),
                UsedType("Auditable")
            )
        }

        @Test
        fun `should extract the nullable return type of a method but not of a function`() {
            // Arrange
            val code = """
                class Orders {
                    function find(): ?Order {}
                }
                function latest(): ?Invoice {}
            """.trimIndent()

            // Act
            val typesOfClass = usedTypesOf(code, "Orders")
            val typesOfFunction = usedTypesOf(code, "latest")

            // Assert
            assertThat(typesOfClass).containsExactly(UsedType("Order", usage = TypeUsage.RETURN_VALUE))
            assertThat(typesOfFunction).isEmpty()
        }

        @Test
        fun `should leave out a nullable parameter type and a base class written as a qualified name`() {
            // Arrange
            val code = "class Order extends \\App\\Entity {\n    function pay(?Gateway ${'$'}gateway) {}\n}"

            // Act
            val usedTypes = usedTypesOf(code, "Order")

            // Assert
            assertThat(usedTypes).isEmpty()
        }

        @Test
        fun `should extract a qualified return type as written`() {
            // Arrange
            val code = "function latest(): \\App\\Models\\Order {}"

            // Act
            val usedTypes = usedTypesOf(code, "latest")

            // Assert
            assertThat(usedTypes).containsExactly(UsedType("\\App\\Models\\Order", usage = TypeUsage.RETURN_VALUE))
        }

        @Test
        fun `should replace an alias by the name it stands for`() {
            // Arrange
            val code = "use App\\Models\\Order as Purchase;\nfunction latest(): Purchase {}"

            // Act
            val usedTypes = usedTypesOf(code, "latest")

            // Assert
            assertThat(usedTypes).containsExactly(UsedType("Order", usage = TypeUsage.RETURN_VALUE))
        }

        @Test
        fun `should extract an imported constant first when its name occurs in the declaration`() {
            // Arrange
            val code = """
                use const App\Limits\MAXIMUM;
                function isFull(Cart ${'$'}cart) { return ${'$'}cart->size() >= MAXIMUM; }
                function isEmpty(Cart ${'$'}cart) { return ${'$'}cart->size() === 0; }
            """.trimIndent()

            // Act
            val typesOfIsFull = usedTypesOf(code, "isFull")
            val typesOfIsEmpty = usedTypesOf(code, "isEmpty")

            // Assert
            assertThat(typesOfIsFull).containsExactly(
                UsedType("MAXIMUM", usage = TypeUsage.CONSTANT_ACCESS),
                UsedType("Cart", usage = TypeUsage.ARGUMENT)
            )
            assertThat(typesOfIsEmpty).containsExactly(UsedType("Cart", usage = TypeUsage.ARGUMENT))
        }

        @Test
        fun `should treat an import with const in a segment as a constant`() {
            // Arrange
            val code = "use App\\Reconstruction\\Order;\nfunction latest(): Order {}"

            // Act
            val usedTypes = usedTypesOf(code, "latest")

            // Assert
            assertThat(usedTypes).containsExactly(
                UsedType("Order", usage = TypeUsage.CONSTANT_ACCESS),
                UsedType("Order", usage = TypeUsage.RETURN_VALUE)
            )
        }

        @Test
        fun `should give a trait no used types`() {
            // Arrange
            val code = "trait Auditable {\n    function audit(Logger ${'$'}logger) {}\n}"

            // Act
            val usedTypes = usedTypesOf(code, "Auditable")

            // Assert
            assertThat(usedTypes).isEmpty()
        }
    }
}
