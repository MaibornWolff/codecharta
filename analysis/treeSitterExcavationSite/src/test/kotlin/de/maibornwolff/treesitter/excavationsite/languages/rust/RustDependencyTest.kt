package de.maibornwolff.treesitter.excavationsite.languages.rust

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

class RustDependencyTest {
    private fun usedTypesOf(code: String, declarationName: String): Set<UsedType> {
        val result = TreeSitterDependencies.analyze(code, Language.RUST)
        return result.declarations.first { it.name == declarationName }.usedTypes
    }

    @Nested
    inner class ApiSupportCheck {
        @Test
        fun `should report Rust as dependency-supported`() {
            // Arrange & Act
            val supported = TreeSitterDependencies.isDependencyAnalysisSupported(Language.RUST)

            // Assert
            assertThat(supported).isTrue()
            assertThat(Language.RUST in TreeSitterDependencies.getSupportedLanguages()).isTrue()
        }
    }

    @Nested
    inner class PackageExtraction {
        @Test
        fun `should return empty package path because module path is derived by the consumer`() {
            // Arrange
            val code = """
                mod a {
                    struct Foo {}
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.RUST)

            // Assert
            assertThat(result.packagePath).isEmpty()
        }
    }

    @Nested
    inner class ImportExtraction {
        @Test
        fun `should extract a simple scoped use`() {
            // Arrange
            val code = "use a::b::C;"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.RUST)

            // Assert
            assertThat(result.imports).containsExactly(
                ImportDeclaration(path = listOf("a", "b", "C"), isWildcard = false, bindingName = "C")
            )
        }

        @Test
        fun `should flatten a nested use list`() {
            // Arrange
            val code = "use a::{b, c::D};"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.RUST)

            // Assert
            assertThat(result.imports).containsExactly(
                ImportDeclaration(path = listOf("a", "b"), isWildcard = false, bindingName = "b"),
                ImportDeclaration(path = listOf("a", "c", "D"), isWildcard = false, bindingName = "D")
            )
        }

        @Test
        fun `should extract a glob use as wildcard`() {
            // Arrange
            val code = "use a::b::*;"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.RUST)

            // Assert
            assertThat(result.imports).containsExactly(
                ImportDeclaration(path = listOf("a", "b"), isWildcard = true)
            )
        }

        @Test
        fun `should keep the original path for an aliased use`() {
            // Arrange
            val code = "use a::B as C;"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.RUST)

            // Assert
            assertThat(result.imports).containsExactly(
                ImportDeclaration(path = listOf("a", "B"), isWildcard = false, bindingName = "C")
            )
        }

        @Test
        fun `should tag a pub use re-export with the REEXPORT kind`() {
            // Arrange
            val code = "pub use a::B;"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.RUST)

            // Assert
            assertThat(result.imports).containsExactly(
                ImportDeclaration(path = listOf("a", "B"), isWildcard = false, kind = ImportKind.REEXPORT, bindingName = "B")
            )
        }

        @Test
        fun `should keep leading crate self and super segments verbatim`() {
            // Arrange
            val code = """
                use crate::foo::Bar;
                use self::x::Y;
                use super::z::W;
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.RUST)

            // Assert
            assertThat(result.imports).containsExactly(
                ImportDeclaration(path = listOf("crate", "foo", "Bar"), isWildcard = false, bindingName = "Bar"),
                ImportDeclaration(path = listOf("self", "x", "Y"), isWildcard = false, bindingName = "Y"),
                ImportDeclaration(path = listOf("super", "z", "W"), isWildcard = false, bindingName = "W")
            )
        }
    }

    @Nested
    inner class DeclarationExtraction {
        @Test
        fun `should extract a top-level struct`() {
            // Arrange
            val code = "struct Foo { bar: Bar }"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.RUST)

            // Assert
            assertThat(result.declarations)
                .extracting("name", "type")
                .containsExactly(tuple("Foo", DeclarationType.CLASS))
        }

        @Test
        fun `should map every item kind to its declaration type`() {
            // Arrange
            val code = """
                struct AStruct {}
                union AUnion { f: u32 }
                enum AnEnum { V }
                trait ATrait {}
                type AnAlias = u32;
                fn a_function() {}
                const A_CONST: u32 = 0;
                static A_STATIC: u32 = 0;
                macro_rules! a_macro { () => {} }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.RUST)

            // Assert
            assertThat(result.declarations).extracting("name", "type").containsExactlyInAnyOrder(
                tuple("AStruct", DeclarationType.CLASS),
                tuple("AUnion", DeclarationType.CLASS),
                tuple("AnEnum", DeclarationType.ENUM),
                tuple("ATrait", DeclarationType.INTERFACE),
                tuple("AnAlias", DeclarationType.CLASS),
                tuple("a_function", DeclarationType.FUNCTION),
                tuple("A_CONST", DeclarationType.VARIABLE),
                tuple("A_STATIC", DeclarationType.VARIABLE),
                tuple("a_macro", DeclarationType.FUNCTION)
            )
        }

        @Test
        fun `should record the inline module chain as parent path`() {
            // Arrange
            val code = """
                mod a {
                    mod b {
                        struct Foo { x: NestedField }
                    }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.RUST)

            // Assert
            val foo = result.declarations.first { it.name == "Foo" }
            assertThat(foo.parentPath).containsExactly("a", "b")
        }

        @Test
        fun `should not emit modules or impl blocks as declarations`() {
            // Arrange
            val code = """
                mod a {
                    struct Foo {}
                    impl Foo {}
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.RUST)

            // Assert
            assertThat(result.declarations.map { it.name }).containsExactly("Foo")
        }

        @Test
        fun `should fold impl trait for type into the target type used types`() {
            // Arrange
            val code = """
                struct Foo {}
                impl Bar for Foo {
                    fn method(&self, p: ParamT) -> RetT { todo!() }
                }
            """.trimIndent()

            // Act
            val foo = usedTypesOf(code, "Foo")

            // Assert
            assertThat(foo).containsExactlyInAnyOrder(
                UsedType(name = "Bar"),
                UsedType(name = "ParamT"),
                UsedType(name = "RetT")
            )
        }

        @Test
        fun `should fold inherent impl methods into the target type used types`() {
            // Arrange
            val code = """
                struct Foo {}
                impl Foo {
                    fn inherent(&self, p: ParamType) -> ReturnType { todo!() }
                }
            """.trimIndent()

            // Act
            val foo = usedTypesOf(code, "Foo")

            // Assert
            assertThat(foo).containsExactlyInAnyOrder(
                UsedType(name = "ParamType"),
                UsedType(name = "ReturnType")
            )
        }

        @Test
        fun `should skip declarations without a resolvable name`() {
            // Arrange
            val code = "struct Foo {}"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.RUST)

            // Assert
            assertThat(result.declarations).noneMatch { it.name.isBlank() }
        }
    }

    @Nested
    inner class UsedTypeExtraction {
        @Test
        fun `should extract struct field types and skip primitives`() {
            // Arrange
            val code = "struct Foo { bar: Bar, baz: Vec<Qux>, n: u32 }"

            // Act
            val foo = usedTypesOf(code, "Foo")

            // Assert
            assertThat(foo).containsExactlyInAnyOrder(
                UsedType(name = "Bar"),
                UsedType(name = "Vec", genericTypes = listOf(UsedType(name = "Qux")))
            )
        }

        @Test
        fun `should extract tuple struct field types`() {
            // Arrange
            val code = "struct Pair(Inner, Other);"

            // Act
            val pair = usedTypesOf(code, "Pair")

            // Assert
            assertThat(pair).containsExactlyInAnyOrder(UsedType(name = "Inner"), UsedType(name = "Other"))
        }

        @Test
        fun `should extract enum variant payload types`() {
            // Arrange
            val code = "enum Color { Red, Custom(Payload), Struct { field: FieldType } }"

            // Act
            val color = usedTypesOf(code, "Color")

            // Assert
            assertThat(color).containsExactlyInAnyOrder(UsedType(name = "Payload"), UsedType(name = "FieldType"))
        }

        @Test
        fun `should extract function parameter return generic and where types`() {
            // Arrange
            val code = "fn f<T: Bound>(p: ParamType) -> ReturnType where T: WhereType { todo!() }"

            // Act
            val f = usedTypesOf(code, "f")

            // Assert
            assertThat(f).containsExactlyInAnyOrder(
                UsedType(name = "ParamType"),
                UsedType(name = "ReturnType"),
                UsedType(name = "Bound"),
                UsedType(name = "WhereType")
            )
        }

        @Test
        fun `should extract trait supertraits and method signature types`() {
            // Arrange
            val code = "trait MyTrait: SuperTrait + Other { fn method(&self) -> RetType; }"

            // Act
            val trait = usedTypesOf(code, "MyTrait")

            // Assert
            assertThat(trait).containsExactlyInAnyOrder(
                UsedType(name = "SuperTrait"),
                UsedType(name = "Other"),
                UsedType(name = "RetType")
            )
        }

        @Test
        fun `should unwrap references slices and tuples`() {
            // Arrange
            val code = "fn f(a: &Foo, b: &mut Bar, c: [Baz; 3], d: &[Slice], e: (T1, T2)) { todo!() }"

            // Act
            val f = usedTypesOf(code, "f")

            // Assert
            assertThat(f).containsExactlyInAnyOrder(
                UsedType(name = "Foo"),
                UsedType(name = "Bar"),
                UsedType(name = "Baz"),
                UsedType(name = "Slice"),
                UsedType(name = "T1"),
                UsedType(name = "T2")
            )
        }

        @Test
        fun `should keep generics nested without flat duplicates`() {
            // Arrange
            val code = "struct S { f: Map<Key, Vec<Item>> }"

            // Act
            val s = usedTypesOf(code, "S")

            // Assert
            assertThat(s).containsExactly(
                UsedType(
                    name = "Map",
                    genericTypes = listOf(
                        UsedType(name = "Key"),
                        UsedType(name = "Vec", genericTypes = listOf(UsedType(name = "Item")))
                    )
                )
            )
        }

        @Test
        fun `should capture namespace prefix for qualified inline types`() {
            // Arrange
            val code = "struct S { f: crate::a::Qualified }"

            // Act
            val s = usedTypesOf(code, "S")

            // Assert
            assertThat(s).containsExactly(
                UsedType(name = "Qualified", namespacePrefix = listOf("crate", "a"))
            )
        }

        @Test
        fun `should extract the right hand side of a type alias`() {
            // Arrange
            val code = "type Alias = SomeType<Generic>;"

            // Act
            val alias = usedTypesOf(code, "Alias")

            // Assert
            assertThat(alias).containsExactly(
                UsedType(name = "SomeType", genericTypes = listOf(UsedType(name = "Generic")))
            )
        }

        @Test
        fun `should extract types nested inside function pointer and Fn trait types`() {
            // Arrange
            val code = "struct S { f: Box<dyn Fn(Arg) -> Inner>, g: fn(P) -> R }"

            // Act
            val s = usedTypesOf(code, "S")

            // Assert
            assertThat(s).containsExactlyInAnyOrder(
                UsedType(
                    name = "Box",
                    genericTypes = listOf(UsedType(name = "Fn"), UsedType(name = "Arg"), UsedType(name = "Inner"))
                ),
                UsedType(name = "P"),
                UsedType(name = "R")
            )
        }

        @Test
        fun `should drop Self and qualified-type prefixes from the namespace prefix`() {
            // Arrange
            val code = "struct S { h: Self::Item, i: <T as Tr>::Out }"

            // Act
            val s = usedTypesOf(code, "S")

            // Assert
            assertThat(s).containsExactlyInAnyOrder(
                UsedType(name = "Item"),
                UsedType(name = "Out")
            )
        }
    }
}
