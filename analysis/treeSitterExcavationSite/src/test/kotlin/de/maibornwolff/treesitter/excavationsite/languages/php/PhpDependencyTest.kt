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
        fun `should give each declaration the namespace of the block it stands in as parent path`() {
            // Arrange
            val code = "namespace Shop;\nclass Cart {}\nnamespace Admin;\nfunction panel() {}"

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.declarations).extracting({ it.name }, { it.parentPath }).containsExactly(
                tuple("Cart", listOf("Shop")),
                tuple("panel", listOf("Admin"))
            )
        }

        @Test
        fun `should give a declaration in braces its namespace and one in the global block none`() {
            // Arrange
            val code = "namespace Shop\\Model {\n    class Cart {}\n}\nnamespace {\n    class Legacy {}\n}"

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.declarations).extracting({ it.name }, { it.parentPath }).containsExactly(
                tuple("Cart", listOf("Shop", "Model")),
                tuple("Legacy", emptyList<String>())
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
        fun `should read the constant that is the value of a const as a use of it`() {
            // Arrange
            val code = "const LIMIT = MAXIMUM;"

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.declarations).containsExactly(
                Declaration("LIMIT", DeclarationType.VARIABLE, setOf(UsedType("MAXIMUM", usage = TypeUsage.CONSTANT_ACCESS)))
            )
        }

        @Test
        fun `should extract a constant of a namespace in braces with its namespace`() {
            // Arrange
            val code = "namespace Game {\n    const MAX = 3;\n}"

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.declarations).extracting({ it.name }, { it.parentPath }).containsExactly(tuple("MAX", listOf("Game")))
        }

        @Test
        fun `should declare the constant define names in the namespace its name gives`() {
            // Arrange
            val code = "namespace App;\ndefine('Game\\\\MAX', LIMIT);\ndefine('MIN', 1);"

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.declarations).extracting({ it.name }, { it.parentPath }, { it.usedTypes }).containsExactly(
                tuple(
                    "MAX",
                    listOf("Game"),
                    setOf(
                        UsedType(
                            "LIMIT",
                            namespacePrefix = listOf("App"),
                            usage = TypeUsage.CONSTANT_ACCESS,
                            fallbacks = listOf(UsedType("LIMIT", usage = TypeUsage.CONSTANT_ACCESS))
                        )
                    )
                ),
                tuple("MIN", emptyList<String>(), emptySet<UsedType>())
            )
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
    inner class NameResolution {
        private fun pathsOf(code: String, declarationName: String): List<List<String>> =
            usedTypesOf(code, declarationName).map { it.namespacePrefix + it.name }

        @Test
        fun `should resolve an unqualified class name in the current namespace`() {
            // Arrange
            val code = "namespace Game\\Model;\nclass Horse {\n    public Speed ${'$'}speed;\n}"

            // Act
            val paths = pathsOf(code, "Horse")

            // Assert
            assertThat(paths).containsExactly(listOf("Game", "Model", "Speed"))
        }

        @Test
        fun `should resolve a qualified class name through the namespace import of its first segment`() {
            // Arrange
            val code = "namespace Game\\App;\nuse Game\\Domain\\Model;\nclass Util {\n    public Model\\Creature ${'$'}creature;\n}"

            // Act
            val paths = pathsOf(code, "Util")

            // Assert
            assertThat(paths).containsExactly(listOf("Game", "Domain", "Model", "Creature"))
        }

        @Test
        fun `should resolve a qualified class name without an import below the current namespace`() {
            // Arrange
            val code = "namespace Game\\App;\nclass Util {\n    public Model\\Creature ${'$'}creature;\n}"

            // Act
            val paths = pathsOf(code, "Util")

            // Assert
            assertThat(paths).containsExactly(listOf("Game", "App", "Model", "Creature"))
        }

        @Test
        fun `should resolve a name below the namespace keyword in the current namespace`() {
            // Arrange
            val code = "namespace Game\\App;\nclass Box {\n    public namespace\\Sub\\Tool ${'$'}tool;\n}"

            // Act
            val paths = pathsOf(code, "Box")

            // Assert
            assertThat(paths).containsExactly(listOf("Game", "App", "Sub", "Tool"))
        }

        @Test
        fun `should resolve a member of a group import by its alias`() {
            // Arrange
            val code = "namespace Game\\App;\nuse Game\\Model\\{Creature, Speed as Pace};\nclass Herd {\n    public Pace ${'$'}pace;\n}"

            // Act
            val paths = pathsOf(code, "Herd")

            // Assert
            assertThat(paths).containsExactly(listOf("Game", "Model", "Speed"))
        }

        @Test
        fun `should resolve a name only through the imports of its own namespace block`() {
            // Arrange
            val code = """
                namespace Shop;
                use Shop\Model\Item;
                class Cart {}
                namespace Admin;
                class Panel {
                    public Item ${'$'}item;
                }
            """.trimIndent()

            // Act
            val paths = pathsOf(code, "Panel")

            // Assert
            assertThat(paths).containsExactly(listOf("Admin", "Item"))
        }

        @Test
        fun `should resolve a called function in the current namespace with the global one as fallback`() {
            // Arrange
            val code = "namespace App;\nfunction run() {\n    return helper();\n}"

            // Act
            val usedTypes = usedTypesOf(code, "run")

            // Assert
            assertThat(usedTypes).containsExactly(
                UsedType("helper", namespacePrefix = listOf("App"), fallbacks = listOf(UsedType("helper")))
            )
        }

        @Test
        fun `should resolve a called function through its function import without a fallback`() {
            // Arrange
            val code = "namespace App;\nuse function Game\\Dice\\roll;\nfunction hit() {\n    return roll();\n}"

            // Act
            val usedTypes = usedTypesOf(code, "hit")

            // Assert
            assertThat(usedTypes).containsExactly(UsedType("roll", namespacePrefix = listOf("Game", "Dice")))
        }

        @Test
        fun `should resolve a qualified function name through the namespace import of its first segment`() {
            // Arrange
            val code = "namespace App;\nuse Game\\Dice;\nfunction hit() {\n    return Dice\\roll();\n}"

            // Act
            val paths = pathsOf(code, "hit")

            // Assert
            assertThat(paths).containsExactly(listOf("Game", "Dice", "roll"))
        }

        @Test
        fun `should resolve a constant read through its constant import`() {
            // Arrange
            val code = "namespace App;\nuse const Game\\Limits\\MAX;\nfunction cap() {\n    return MAX + \\Game\\MIN;\n}"

            // Act
            val usedTypes = usedTypesOf(code, "cap")

            // Assert
            assertThat(usedTypes).containsExactly(
                UsedType("MAX", namespacePrefix = listOf("Game", "Limits"), usage = TypeUsage.CONSTANT_ACCESS),
                UsedType("MIN", namespacePrefix = listOf("Game"), usage = TypeUsage.CONSTANT_ACCESS)
            )
        }

        @Test
        fun `should not read a method, property or argument name as a constant`() {
            // Arrange
            val code = "namespace App;\nfunction run(${'$'}cart) {\n    return ${'$'}cart->total(limit: 3)->items;\n}"

            // Act
            val usedTypes = usedTypesOf(code, "run")

            // Assert
            assertThat(usedTypes).isEmpty()
        }

        @Test
        fun `should leave out the own class and the type keywords`() {
            // Arrange
            val code = "namespace Game;\nclass Horse {\n    function same(): self {}\n    function count(): int {}\n}"

            // Act
            val usedTypes = usedTypesOf(code, "Horse")

            // Assert
            assertThat(usedTypes).isEmpty()
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
        fun `should extract every type of a parameter, a property and a catch clause`() {
            // Arrange
            val code = """
                class Svc {
                    public ?H ${'$'}h = null;
                    function __construct(private G ${'$'}g) {}
                    function take(?A ${'$'}a, B|C ${'$'}bc, D&E ${'$'}de, F ...${'$'}fs) {
                        try {} catch (NotFound | Gone ${'$'}failure) {}
                        return fn (I ${'$'}i): J => ${'$'}i;
                    }
                }
            """.trimIndent()

            // Act
            val usedTypes = usedTypesOf(code, "Svc")

            // Assert
            assertThat(usedTypes.map { it.name to it.usage }).containsExactly(
                "J" to TypeUsage.RETURN_VALUE,
                "G" to TypeUsage.ARGUMENT,
                "A" to TypeUsage.ARGUMENT,
                "B" to TypeUsage.ARGUMENT,
                "C" to TypeUsage.ARGUMENT,
                "D" to TypeUsage.ARGUMENT,
                "E" to TypeUsage.ARGUMENT,
                "F" to TypeUsage.ARGUMENT,
                "I" to TypeUsage.ARGUMENT,
                "H" to TypeUsage.USAGE,
                "NotFound" to TypeUsage.USAGE,
                "Gone" to TypeUsage.USAGE
            )
        }

        @Test
        fun `should extract the nullable return type of a method and of a function`() {
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
            assertThat(typesOfFunction).containsExactly(UsedType("Invoice", usage = TypeUsage.RETURN_VALUE))
        }

        @Test
        fun `should extract a base class written as a qualified name and a nullable parameter type`() {
            // Arrange
            val code = "class Order extends \\App\\Entity {\n    function pay(?Gateway ${'$'}gateway) {}\n}"

            // Act
            val usedTypes = usedTypesOf(code, "Order")

            // Assert
            assertThat(usedTypes).containsExactly(
                UsedType("Entity", namespacePrefix = listOf("App"), usage = TypeUsage.INHERITANCE),
                UsedType("Gateway", usage = TypeUsage.ARGUMENT)
            )
        }

        @Test
        fun `should extract a fully qualified return type as the path it names`() {
            // Arrange
            val code = "function latest(): \\App\\Models\\Order {}"

            // Act
            val usedTypes = usedTypesOf(code, "latest")

            // Assert
            assertThat(usedTypes).containsExactly(
                UsedType("Order", namespacePrefix = listOf("App", "Models"), usage = TypeUsage.RETURN_VALUE)
            )
        }

        @Test
        fun `should replace an alias by the name it stands for in the namespace it imports`() {
            // Arrange
            val code = "use App\\Models\\Order as Purchase;\nfunction latest(): Purchase {}"

            // Act
            val usedTypes = usedTypesOf(code, "latest")

            // Assert
            assertThat(
                usedTypes
            ).containsExactly(UsedType("Order", namespacePrefix = listOf("App", "Models"), usage = TypeUsage.RETURN_VALUE))
        }

        @Test
        fun `should extract an imported constant first where it is read`() {
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
                UsedType("MAXIMUM", namespacePrefix = listOf("App", "Limits"), usage = TypeUsage.CONSTANT_ACCESS),
                UsedType("Cart", usage = TypeUsage.ARGUMENT)
            )
            assertThat(typesOfIsEmpty).containsExactly(UsedType("Cart", usage = TypeUsage.ARGUMENT))
        }

        @Test
        fun `should not take an import with const in a segment for a constant`() {
            // Arrange
            val code = "use App\\Reconstruction\\Order;\nfunction latest(): Order {}"

            // Act
            val usedTypes = usedTypesOf(code, "latest")

            // Assert
            assertThat(
                usedTypes
            ).containsExactly(UsedType("Order", namespacePrefix = listOf("App", "Reconstruction"), usage = TypeUsage.RETURN_VALUE))
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
