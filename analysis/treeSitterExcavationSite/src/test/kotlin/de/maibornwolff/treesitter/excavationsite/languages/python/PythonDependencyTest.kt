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

    private fun use(name: String, vararg module: String) = UsedType(name, namespacePrefix = module.toList())

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
        fun `should extract a class nested in a class as a declaration of its own below the outer class`() {
            // Arrange
            val code = """
                from shop import Money, Product

                class Order:
                    class Line:
                        def __init__(self, product: Product):
                            pass

                    def total(self) -> Money:
                        pass
            """.trimIndent()

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.declarations).extracting({ it.name }, { it.parentPath }, { it.type }).containsExactly(
                tuple("Order", emptyList<String>(), DeclarationType.CLASS),
                tuple("Line", listOf("Order"), DeclarationType.CLASS)
            )
            assertThat(result.declarations.map { declaration -> declaration.usedTypes.map { it.name } }).containsExactly(
                listOf("Money"),
                listOf("Product")
            )
        }

        @Test
        fun `should extract a decorated nested class and a class nested in it with the classes around them as parent path`() {
            // Arrange
            val code = """
                from dataclasses import dataclass

                class Shop:
                    @dataclass
                    class Order:
                        class Line:
                            pass
            """.trimIndent()

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.declarations).extracting({ it.name }, { it.parentPath }).containsExactly(
                tuple("Shop", emptyList<String>()),
                tuple("Order", listOf("Shop")),
                tuple("Line", listOf("Shop", "Order"))
            )
            assertThat(result.declarations[1].usedTypes).containsExactly(use("dataclass", "dataclasses"))
        }

        @Test
        fun `should not extract a class declared in a method`() {
            // Arrange
            val code = """
                class Order:
                    def build(self):
                        class Draft:
                            pass
                        return Draft()
            """.trimIndent()

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.declarations.map { it.name }).containsExactly("Order")
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
        fun `should report a name an import binds as the imported name behind its module`() {
            // Arrange
            val code = """
                from shop.orders import Order, Invoice as Bill

                class Cart(Order):
                    def total(self) -> Bill:
                        pass
            """.trimIndent()

            // Act
            val usedTypes = usedTypesOf(code, "Cart")

            // Assert
            assertThat(usedTypes).containsExactly(use("Order", "shop", "orders"), use("Invoice", "shop", "orders"))
        }

        @Test
        fun `should report a declaration of the own module without a module`() {
            // Arrange
            val code = """
                class Base:
                    pass

                class Cart(Base):
                    pass
            """.trimIndent()

            // Act
            val usedTypes = usedTypesOf(code, "Cart")

            // Assert
            assertThat(usedTypes).containsExactly(UsedType("Base"))
        }

        @Test
        fun `should report a name behind an imported module with the attribute names behind it`() {
            // Arrange
            val code = """
                import shop.orders as orders
                import shop.billing

                def load():
                    return orders.Order(), shop.billing.Invoice.create()
            """.trimIndent()

            // Act
            val usedTypes = usedTypesOf(code, "load")

            // Assert
            assertThat(usedTypes).containsExactly(use("Order", "shop", "orders"), use("billing.Invoice.create", "shop"))
        }

        @Test
        fun `should report a name of a relative import behind one dot segment per leading dot`() {
            // Arrange
            val code = """
                from ..core.base import Entity
                from . import helper

                def load():
                    return Entity(), helper.Helper()
            """.trimIndent()

            // Act
            val usedTypes = usedTypesOf(code, "load")

            // Assert
            assertThat(usedTypes).containsExactly(use("Entity", ".", ".", "core", "base"), use("helper.Helper", "."))
        }

        @Test
        fun `should report no builtin and no name that nothing binds`() {
            // Arrange
            val code = """
                def load(values):
                    print(len(values))
                    return Unknown()
            """.trimIndent()

            // Act
            val usedTypes = usedTypesOf(code, "load")

            // Assert
            assertThat(usedTypes).isEmpty()
        }

        @Test
        fun `should report a decorator`() {
            // Arrange
            val code = """
                from app import register

                @register
                class Order:
                    pass
            """.trimIndent()

            // Act
            val usedTypes = usedTypesOf(code, "Order")

            // Assert
            assertThat(usedTypes).containsExactly(use("register", "app"))
        }

        @Test
        fun `should report the annotations and default values of parameters, not their names`() {
            // Arrange
            val code = """
                from shop import Rate, LIMIT

                def load(first, second: Rate, third=LIMIT, *rest, **options):
                    return None
            """.trimIndent()

            // Act
            val usedTypes = usedTypesOf(code, "load")

            // Assert
            assertThat(usedTypes).containsExactly(use("Rate", "shop"), use("LIMIT", "shop"))
        }

        @Test
        fun `should report the value of a keyword argument, not its keyword`() {
            // Arrange
            val code = """
                from shop import Base, Meta

                class Order(Base, metaclass=Meta):
                    pass
            """.trimIndent()

            // Act
            val usedTypes = usedTypesOf(code, "Order")

            // Assert
            assertThat(usedTypes).containsExactly(use("Base", "shop"), use("Meta", "shop"))
        }

        @Test
        fun `should report no name of an import or a global statement inside a definition`() {
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
        fun `should report the class of a class pattern, not its keywords`() {
            // Arrange
            val code = """
                from shapes import Point

                def describe(shape):
                    match shape:
                        case Point(x=0):
                            return None
            """.trimIndent()

            // Act
            val usedTypes = usedTypesOf(code, "describe")

            // Assert
            assertThat(usedTypes).containsExactly(use("Point", "shapes"))
        }

        @Test
        fun `should report a nested class through the class around it as one name`() {
            // Arrange
            val code = """
                class Order:
                    class Line:
                        pass

                class Invoice:
                    def add(self, line: Order.Line):
                        pass
            """.trimIndent()

            // Act
            val usedTypes = usedTypesOf(code, "Invoice")

            // Assert
            assertThat(usedTypes).containsExactly(UsedType("Order.Line"))
        }
    }

    @Nested
    inner class BindingPythonSees {
        @Test
        fun `should report the own declaration that follows an import of its name for a use in a function body`() {
            // Arrange
            val code = """
                from app.other import Node

                class Node:
                    pass

                def grow():
                    return Node()
            """.trimIndent()

            // Act
            val usedTypes = usedTypesOf(code, "grow")

            // Assert
            assertThat(usedTypes).containsExactly(UsedType("Node"))
        }

        @Test
        fun `should report the import that follows a declaration of its name for a use in a function body`() {
            // Arrange
            val code = """
                class Node:
                    pass

                from app.other import Node

                def grow():
                    return Node()
            """.trimIndent()

            // Act
            val usedTypes = usedTypesOf(code, "grow")

            // Assert
            assertThat(usedTypes).containsExactly(use("Node", "app", "other"))
        }

        @Test
        fun `should report for a base class the binding before its statement and for a body the last one`() {
            // Arrange
            val code = """
                from app.lib import Node

                class Tree(Node):
                    def child(self):
                        return Node()

                class Node:
                    pass
            """.trimIndent()

            // Act
            val usedTypes = usedTypesOf(code, "Tree")

            // Assert
            assertThat(usedTypes).containsExactly(use("Node", "app", "lib"), UsedType("Node"))
        }

        @Test
        fun `should report for a decorator the binding before its statement`() {
            // Arrange
            val code = """
                from app.lib import register

                @register
                def handle():
                    return None

                def register(function):
                    return function
            """.trimIndent()

            // Act
            val usedTypes = usedTypesOf(code, "handle")

            // Assert
            assertThat(usedTypes).containsExactly(use("register", "app", "lib"))
        }

        @Test
        fun `should report for an annotation the last binding of the module`() {
            // Arrange
            val code = """
                from app.lib import Node

                class Tree:
                    def child(self) -> Node:
                        return None

                class Node:
                    pass
            """.trimIndent()

            // Act
            val usedTypes = usedTypesOf(code, "Tree")

            // Assert
            assertThat(usedTypes).containsExactly(UsedType("Node"))
        }

        @Test
        fun `should report the latest wildcard import first and the earlier one as fallback, but no private name`() {
            // Arrange
            val code = """
                from app.first import *
                from app.second import *

                def grow():
                    return Node(), _hidden()
            """.trimIndent()

            // Act
            val usedTypes = usedTypesOf(code, "grow")

            // Assert
            assertThat(usedTypes).containsExactly(
                use("Node", "app", "second").copy(fallbacks = listOf(use("Node", "app", "first")))
            )
        }

        @Test
        fun `should report a wildcard import after an explicit one first and the explicit one as fallback`() {
            // Arrange
            val code = """
                from app.models import Node
                from app.extra import *

                def grow():
                    return Node()
            """.trimIndent()

            // Act
            val usedTypes = usedTypesOf(code, "grow")

            // Assert
            assertThat(usedTypes).containsExactly(
                use("Node", "app", "extra").copy(fallbacks = listOf(use("Node", "app", "models")))
            )
        }
    }

    @Nested
    inner class NamesOfTheEnclosingScopes {
        @Test
        fun `should not report a parameter used in the body`() {
            // Arrange
            val code = """
                from shop import Model

                def build(Model, *parts, **options):
                    return Model(parts, options)
            """.trimIndent()

            // Act
            val usedTypes = usedTypesOf(code, "build")

            // Assert
            assertThat(usedTypes).isEmpty()
        }

        @Test
        fun `should not report a name the function binds anywhere in its body`() {
            // Arrange
            val code = """
                from shop import Model, Item, Handle, Count
                from errors import Error

                def rebuild(items):
                    first = Model
                    Model = object
                    for index, Item in enumerate(items):
                        pass
                    with open() as Handle:
                        pass
                    try:
                        pass
                    except Error as error:
                        pass
                    if (Count := len(items)):
                        pass
                    def helper():
                        return Model, index, Item, Handle, error, Count
                    return first
            """.trimIndent()

            // Act
            val usedTypes = usedTypesOf(code, "rebuild")

            // Assert
            assertThat(usedTypes).containsExactly(use("Error", "errors"))
        }

        @Test
        fun `should report a name a global statement hands on to the module`() {
            // Arrange
            val code = """
                from shop import Registry

                def reset():
                    global Registry
                    Registry = Registry()
            """.trimIndent()

            // Act
            val usedTypes = usedTypesOf(code, "reset")

            // Assert
            assertThat(usedTypes).containsExactly(use("Registry", "shop"))
        }

        @Test
        fun `should not report the variable of a comprehension or the parameter of a lambda`() {
            // Arrange
            val code = """
                from shop import Key, entry

                def collect(items):
                    keys = [Key(item) for item in items]
                    return sorted(keys, key=lambda entry: entry.name)
            """.trimIndent()

            // Act
            val usedTypes = usedTypesOf(code, "collect")

            // Assert
            assertThat(usedTypes).containsExactly(use("Key", "shop"))
        }

        @Test
        fun `should not report an attribute behind a name the function binds`() {
            // Arrange
            val code = """
                import shop.models as models

                def make(models):
                    return models.Model()
            """.trimIndent()

            // Act
            val usedTypes = usedTypesOf(code, "make")

            // Assert
            assertThat(usedTypes).isEmpty()
        }

        @Test
        fun `should report a name an import inside a function binds in that function only`() {
            // Arrange
            val code = """
                def make():
                    from shop.models import Model
                    return Model()

                def other():
                    return Model()
            """.trimIndent()

            // Act
            val makeUses = usedTypesOf(code, "make")
            val otherUses = usedTypesOf(code, "other")

            // Assert
            assertThat(makeUses).containsExactly(use("Model", "shop", "models"))
            assertThat(otherUses).isEmpty()
        }

        @Test
        fun `should report a parameter's annotation and default value, which the scope around evaluates`() {
            // Arrange
            val code = """
                from shop import Model

                def make(Model: Model = Model()):
                    return None
            """.trimIndent()

            // Act
            val usedTypes = usedTypesOf(code, "make")

            // Assert
            assertThat(usedTypes).containsExactly(use("Model", "shop"))
        }

        @Test
        fun `should report for a class body the nested class it declared before, for a method the module's name`() {
            // Arrange
            val code = """
                from app.other import Inner

                class Outer:
                    class Inner:
                        pass

                    default = Inner()

                    def make(self):
                        return Inner()
            """.trimIndent()

            // Act
            val usedTypes = usedTypesOf(code, "Outer")

            // Assert
            assertThat(usedTypes).containsExactly(UsedType("Outer.Inner"), use("Inner", "app", "other"))
        }
    }
}
