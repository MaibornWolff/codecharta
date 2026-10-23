package de.maibornwolff.treesitter.excavationsite.languages.python

import de.maibornwolff.treesitter.excavationsite.api.DeclarationType
import de.maibornwolff.treesitter.excavationsite.api.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.api.ImportKind
import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import de.maibornwolff.treesitter.excavationsite.api.UsedType
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.tuple
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class PythonDependencyTest {
    private fun analyze(code: String) = TreeSitterDependencies.analyze(code, Language.PYTHON)

    private fun usedTypesOf(code: String, declarationName: String): Set<UsedType> =
        analyze(code).declarations.first { it.name == declarationName }.usedTypes

    private fun memberImport(vararg path: String, alias: String? = null) =
        ImportDeclaration(path = path.toList(), isWildcard = false, kind = ImportKind.MEMBER, bindingName = alias)

    @Nested
    inner class ApiSupportCheck {
        @Test
        fun `should report Python as dependency-supported`() {
            // Arrange & Act
            val supported = TreeSitterDependencies.isDependencyAnalysisSupported(Language.PYTHON)

            // Assert
            assertThat(supported).isTrue()
        }
    }

    @Nested
    inner class PackageExtraction {
        @Test
        fun `should return an empty package path because the module path is the file path`() {
            // Arrange
            val code = "class Order:\n    pass\n"

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.packagePath).isEmpty()
        }
    }

    @Nested
    inner class ModuleImports {
        @Test
        fun `should extract every module of an import statement`() {
            // Arrange
            val code = "import os, shop.orders\n"

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.imports).containsExactly(
                ImportDeclaration(path = listOf("os"), isWildcard = false),
                ImportDeclaration(path = listOf("shop", "orders"), isWildcard = false)
            )
        }

        @Test
        fun `should extract the alias of a module as binding name`() {
            // Arrange
            val code = "import shop.orders as orders\n"

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.imports).containsExactly(
                ImportDeclaration(path = listOf("shop", "orders"), isWildcard = false, bindingName = "orders")
            )
        }

        @Test
        fun `should extract an import inside a function as well`() {
            // Arrange
            val code = """
                def load():
                    import json
            """.trimIndent()

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.imports).containsExactly(ImportDeclaration(path = listOf("json"), isWildcard = false))
        }
    }

    @Nested
    inner class MemberImports {
        @Test
        fun `should extract one member import per imported name`() {
            // Arrange
            val code = "from shop.orders import Order, Invoice\n"

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.imports).containsExactly(memberImport("shop", "orders", "Order"), memberImport("shop", "orders", "Invoice"))
        }

        @Test
        fun `should extract the names of a parenthesized import list`() {
            // Arrange
            val code = """
                from shop.orders import (
                    Order,
                    Invoice,
                )
            """.trimIndent()

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.imports).containsExactly(memberImport("shop", "orders", "Order"), memberImport("shop", "orders", "Invoice"))
        }

        @Test
        fun `should extract a wildcard import with the path of the module`() {
            // Arrange
            val code = "from shop.orders import *\n"

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.imports).containsExactly(
                ImportDeclaration(path = listOf("shop", "orders"), isWildcard = true, kind = ImportKind.MEMBER)
            )
        }

        @Test
        fun `should extract the alias of an imported name as binding name`() {
            // Arrange
            val code = "from shop.orders import Order as PurchaseOrder\n"

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.imports).containsExactly(memberImport("shop", "orders", "Order", alias = "PurchaseOrder"))
        }

        @Test
        fun `should start a relative import with one dot segment per leading dot`() {
            // Arrange
            val code = """
                from . import sibling
                from .models import Order
                from ...core.base import Entity
            """.trimIndent()

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.imports).containsExactly(
                memberImport(".", "sibling"),
                memberImport(".", "models", "Order"),
                memberImport(".", ".", ".", "core", "base", "Entity")
            )
        }

        @Test
        fun `should not extract a future import`() {
            // Arrange
            val code = "from __future__ import annotations\n"

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.imports).isEmpty()
        }
    }

    @Nested
    inner class DeclarationExtraction {
        @Test
        fun `should extract classes and functions before decorated definitions before variables`() {
            // Arrange
            val code = """
                LIMIT = 10

                @dataclass
                class Invoice:
                    pass

                class Order:
                    pass

                @cache
                def total():
                    pass

                def load():
                    pass
            """.trimIndent()

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.declarations).extracting({ it.name }, { it.type }).containsExactly(
                tuple("Order", DeclarationType.CLASS),
                tuple("load", DeclarationType.FUNCTION),
                tuple("Invoice", DeclarationType.CLASS),
                tuple("total", DeclarationType.FUNCTION),
                tuple("LIMIT", DeclarationType.VARIABLE)
            )
        }

        @Test
        fun `should not extract a method or a nested function`() {
            // Arrange
            val code = """
                class Order:
                    def total(self):
                        def helper():
                            pass
            """.trimIndent()

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.declarations.map { it.name }).containsExactly("Order")
        }

        @Test
        fun `should extract only a plain name on the left of an assignment as variable`() {
            // Arrange
            val code = """
                limit = 10
                config.limit = 20
                first, second = 1, 2
                counts[0] = 3
            """.trimIndent()

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.declarations.map { it.name }).containsExactly("limit")
        }

        @Test
        fun `should give a variable no used types`() {
            // Arrange
            val code = "limit = compute(Order)\n"

            // Act
            val usedTypes = usedTypesOf(code, "limit")

            // Assert
            assertThat(usedTypes).isEmpty()
        }
    }

    @Nested
    inner class UsedNames {
        @Test
        fun `should extract the identifiers of a definition that are uses, in source order`() {
            // Arrange
            val code = """
                class Order(Entity):
                    def total(self, tax: Rate):
                        return Money(self)
            """.trimIndent()

            // Act
            val usedTypes = usedTypesOf(code, "Order")

            // Assert
            assertThat(usedTypes.map { it.name }).containsExactly("Entity", "Rate", "Money")
        }

        @Test
        fun `should extract the identifiers of a decorator`() {
            // Arrange
            val code = """
                @register
                class Order:
                    pass
            """.trimIndent()

            // Act
            val usedTypes = usedTypesOf(code, "Order")

            // Assert
            assertThat(usedTypes).containsExactly(UsedType("register"))
        }

        @Test
        fun `should extract an attribute access as its last name with the rest as namespace prefix, and its first name`() {
            // Arrange
            val code = """
                def load():
                    return shop.orders.Order()
            """.trimIndent()

            // Act
            val usedTypes = usedTypesOf(code, "load")

            // Assert
            assertThat(usedTypes).containsExactly(
                UsedType("shop"),
                UsedType("Order", namespacePrefix = listOf("shop", "orders")),
                UsedType("orders", namespacePrefix = listOf("shop"))
            )
        }

        @Test
        fun `should not extract the names of parameters, but their annotations and default values`() {
            // Arrange
            val code = """
                def load(first, second: Rate, third=LIMIT, fourth: int = DEFAULT, *rest, **options):
                    return None
            """.trimIndent()

            // Act
            val usedTypes = usedTypesOf(code, "load")

            // Assert
            assertThat(usedTypes.map { it.name }).containsExactly("Rate", "LIMIT", "int", "DEFAULT")
        }

        @Test
        fun `should not extract the keyword of a keyword argument, but its value`() {
            // Arrange
            val code = """
                class Order(Base, metaclass=Meta):
                    pass
            """.trimIndent()

            // Act
            val usedTypes = usedTypesOf(code, "Order")

            // Assert
            assertThat(usedTypes.map { it.name }).containsExactly("Base", "Meta")
        }

        @Test
        fun `should not extract the names of an import or a global statement inside a definition`() {
            // Arrange
            val code = """
                def load():
                    global counter
                    import shop.orders as orders
                    from shop.invoices import Invoice
                    return None
            """.trimIndent()

            // Act
            val usedTypes = usedTypesOf(code, "load")

            // Assert
            assertThat(usedTypes).isEmpty()
        }

        @Test
        fun `should extract the class of a class pattern, not its keywords`() {
            // Arrange
            val code = """
                def describe(shape):
                    match shape:
                        case Point(x=0):
                            return None
            """.trimIndent()

            // Act
            val usedTypes = usedTypesOf(code, "describe")

            // Assert
            assertThat(usedTypes.map { it.name }).containsExactly("Point")
        }
    }

    @Nested
    inner class NamesOfTheEnclosingFunction {
        @Test
        fun `should not extract a parameter used in the body`() {
            // Arrange
            val code = """
                def build(Model, *parts, **options):
                    return Model(parts, options)
            """.trimIndent()

            // Act
            val usedTypes = usedTypesOf(code, "build")

            // Assert
            assertThat(usedTypes).isEmpty()
        }

        @Test
        fun `should not extract a name the function binds anywhere in its body`() {
            // Arrange
            val code = """
                def rebuild(items):
                    first = Model
                    Model = object
                    for index, item in enumerate(items):
                        pass
                    with open() as handle:
                        pass
                    try:
                        pass
                    except Error as error:
                        pass
                    if (count := len(items)):
                        pass
                    def helper():
                        return Model, index, item, handle, error, count
                    return first
            """.trimIndent()

            // Act
            val usedTypes = usedTypesOf(code, "rebuild")

            // Assert
            assertThat(usedTypes.map { it.name }).containsExactly("object", "enumerate", "open", "Error", "len")
        }

        @Test
        fun `should extract a name a global statement hands on to the module`() {
            // Arrange
            val code = """
                def reset():
                    global Registry
                    Registry = Registry()
            """.trimIndent()

            // Act
            val usedTypes = usedTypesOf(code, "reset")

            // Assert
            assertThat(usedTypes.map { it.name }).containsExactly("Registry")
        }

        @Test
        fun `should not extract the variable of a comprehension or the parameter of a lambda`() {
            // Arrange
            val code = """
                def collect(items):
                    keys = [Key(item) for item in items]
                    return sorted(keys, key=lambda entry: entry.name)
            """.trimIndent()

            // Act
            val usedTypes = usedTypesOf(code, "collect")

            // Assert
            assertThat(usedTypes.map { it.name }).containsExactly("Key", "sorted")
        }

        @Test
        fun `should not extract an attribute behind a name the function binds`() {
            // Arrange
            val code = """
                def make(models):
                    return models.Model()
            """.trimIndent()

            // Act
            val usedTypes = usedTypesOf(code, "make")

            // Assert
            assertThat(usedTypes).isEmpty()
        }

        @Test
        fun `should extract a name an import inside the function binds`() {
            // Arrange
            val code = """
                def make():
                    from shop.models import Model
                    return Model()
            """.trimIndent()

            // Act
            val usedTypes = usedTypesOf(code, "make")

            // Assert
            assertThat(usedTypes).containsExactly(UsedType("Model"))
        }

        @Test
        fun `should extract a name of a parameter's annotation or default value, which the scope around evaluates`() {
            // Arrange
            val code = """
                def make(Model: Model = Model()):
                    return None
            """.trimIndent()

            // Act
            val usedTypes = usedTypesOf(code, "make")

            // Assert
            assertThat(usedTypes).containsExactly(UsedType("Model"))
        }
    }
}
