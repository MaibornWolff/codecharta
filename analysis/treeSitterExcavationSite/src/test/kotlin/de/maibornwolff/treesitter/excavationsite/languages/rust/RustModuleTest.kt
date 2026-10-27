package de.maibornwolff.treesitter.excavationsite.languages.rust

import de.maibornwolff.treesitter.excavationsite.api.RustExternCrate
import de.maibornwolff.treesitter.excavationsite.api.RustItemKind
import de.maibornwolff.treesitter.excavationsite.api.RustNamespace
import de.maibornwolff.treesitter.excavationsite.api.RustPath
import de.maibornwolff.treesitter.excavationsite.api.RustUse
import de.maibornwolff.treesitter.excavationsite.api.RustVisibility
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.tuple
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class RustModuleTest {
    private fun moduleOf(code: String) = TreeSitterDependencies.rustModule(code.trimIndent())

    @Nested
    inner class ModDeclarations {
        @Test
        fun `should report a file module and an inline module with the inline modules around it`() {
            // Arrange
            val code = """
                pub mod model;
                mod outer {
                    pub(crate) mod inner;
                }
            """

            // Act
            val declarations = moduleOf(code).modDeclarations

            // Assert
            assertThat(declarations).extracting("name", "inlinePath", "visibility", "isInline").containsExactly(
                tuple("model", emptyList<String>(), RustVisibility.PUBLIC, false),
                tuple("outer", emptyList<String>(), RustVisibility.PRIVATE, true),
                tuple("inner", listOf("outer"), RustVisibility.RESTRICTED, false)
            )
        }

        @Test
        fun `should read the path, cfg test and macro_use attributes of a mod declaration`() {
            // Arrange
            val code = """
                #[cfg(test)]
                #[path = "creature_naming.rs"]
                mod naming;
                #[macro_use]
                mod macros;
            """

            // Act
            val declarations = moduleOf(code).modDeclarations

            // Assert
            assertThat(declarations).extracting("name", "pathAttribute", "isTest", "isMacroUse").containsExactly(
                tuple("naming", "creature_naming.rs", true, false),
                tuple("macros", null, false, true)
            )
        }

        @Test
        fun `should mark what a cfg test inline module holds as test code`() {
            // Arrange
            val code = """
                #[cfg(test)]
                mod tests {
                    struct Fake;
                    mod deeper;
                }
                struct Real;
            """

            // Act
            val module = moduleOf(code)

            // Assert
            assertThat(module.items).extracting("name", "isTest").containsExactly(tuple("Fake", true), tuple("Real", false))
            assertThat(module.modDeclarations.single { it.name == "deeper" }.isTest).isTrue()
        }

        @Test
        fun `should keep an attribute for the item after a comment`() {
            // Arrange
            val code = """
                #[cfg(test)]
                // the unit tests
                mod tests;
            """

            // Act
            val declaration = moduleOf(code).modDeclarations.single()

            // Assert
            assertThat(declaration.isTest).isTrue()
        }
    }

    @Nested
    inner class Items {
        @Test
        fun `should report each kind of item with its namespaces`() {
            // Arrange
            val code = """
                struct Named { x: u8 }
                struct Tuple(u8);
                struct Unit;
                enum Kind { A }
                union Bits { a: u8 }
                trait Fightable {}
                type Table = Vec<u8>;
                fn roll() {}
                const MAX: u8 = 3;
                static NAME: &str = "x";
                macro_rules! clamp { () => {} }
            """

            // Act
            val items = moduleOf(code).items

            // Assert
            assertThat(items).extracting("name", "kind").containsExactly(
                tuple("Named", RustItemKind.STRUCT),
                tuple("Tuple", RustItemKind.TUPLE_STRUCT),
                tuple("Unit", RustItemKind.TUPLE_STRUCT),
                tuple("Kind", RustItemKind.ENUM),
                tuple("Bits", RustItemKind.UNION),
                tuple("Fightable", RustItemKind.TRAIT),
                tuple("Table", RustItemKind.TYPE_ALIAS),
                tuple("roll", RustItemKind.FUNCTION),
                tuple("MAX", RustItemKind.CONST),
                tuple("NAME", RustItemKind.STATIC),
                tuple("clamp", RustItemKind.MACRO)
            )
            assertThat(RustItemKind.TUPLE_STRUCT.namespaces).containsExactlyInAnyOrder(RustNamespace.TYPE, RustNamespace.VALUE)
        }

        @Test
        fun `should report the visibility, the inline path and the variants of an item`() {
            // Arrange
            val code = """
                pub mod model {
                    pub(super) enum SpeedType { Walking, Flying(u8), Swimming { depth: u8 } }
                    pub(self) struct Hidden;
                }
            """

            // Act
            val items = moduleOf(code).items

            // Assert
            assertThat(items).extracting("name", "visibility", "inlinePath", "variants").containsExactly(
                tuple("SpeedType", RustVisibility.RESTRICTED, listOf("model"), listOf("Walking", "Flying", "Swimming")),
                tuple("Hidden", RustVisibility.PRIVATE, listOf("model"), emptyList<String>())
            )
        }

        @Test
        fun `should mark a macro_export macro`() {
            // Arrange
            val code = """
                #[macro_export]
                macro_rules! roll { () => { 4 } }
            """

            // Act
            val item = moduleOf(code).items.single()

            // Assert
            assertThat(item.isMacroExport).isTrue()
        }

        @Test
        fun `should report the functions and statics of an extern block and no item of a function body`() {
            // Arrange
            val code = """
                extern "C" {
                    fn abs(input: i32) -> i32;
                    static ERRNO: i32;
                }
                fn outer() {
                    struct Local;
                }
            """

            // Act
            val items = moduleOf(code).items

            // Assert
            assertThat(items).extracting("name", "kind").containsExactly(
                tuple("abs", RustItemKind.FUNCTION),
                tuple("ERRNO", RustItemKind.STATIC),
                tuple("outer", RustItemKind.FUNCTION)
            )
        }
    }

    @Nested
    inner class Uses {
        @Test
        fun `should report each name a use binds with its visibility`() {
            // Arrange
            val code = """
                pub use crate::model::{self, creature::Creature as Entity, speed::*};
                use super::Fightable as _;
            """

            // Act
            val uses = moduleOf(code).uses

            // Assert
            assertThat(uses).extracting("path", "binding", "isGlob", "visibility").containsExactly(
                tuple(listOf("crate", "model"), "model", false, RustVisibility.PUBLIC),
                tuple(listOf("crate", "model", "creature", "Creature"), "Entity", false, RustVisibility.PUBLIC),
                tuple(listOf("crate", "model", "speed"), null, true, RustVisibility.PUBLIC),
                tuple(listOf("super", "Fightable"), null, false, RustVisibility.PRIVATE)
            )
        }

        @Test
        fun `should write a leading double colon as an empty first segment`() {
            // Arrange
            val code = "mod inner { use ::game_model::Creature; }"

            // Act
            val use = moduleOf(code).uses.single()

            // Assert
            assertThat(use).isEqualTo(
                RustUse(listOf("", "game_model", "Creature"), "Creature", false, RustVisibility.PRIVATE, listOf("inner"), offset = 12)
            )
        }
    }

    @Nested
    inner class ImplsAndExternCrates {
        @Test
        fun `should report the type and the trait an impl names at their base`() {
            // Arrange
            val code = """
                impl<T: Copy> Fightable for Vec<model::Creature> {}
                impl Creature {}
            """

            // Act
            val impls = moduleOf(code).impls

            // Assert
            assertThat(impls).extracting("selfType", "trait").containsExactly(
                tuple(RustPath(listOf("Vec"), RustNamespace.TYPE, 28), RustPath(listOf("Fightable"), RustNamespace.TYPE, 14)),
                tuple(RustPath(listOf("Creature"), RustNamespace.TYPE, 57), null)
            )
        }

        @Test
        fun `should report an extern crate with its binding`() {
            // Arrange
            val code = """
                extern crate log;
                extern crate game_model as gm;
            """

            // Act
            val externCrates = moduleOf(code).externCrates

            // Assert
            assertThat(externCrates).containsExactly(
                RustExternCrate("log", "log", emptyList()),
                RustExternCrate("game_model", "gm", emptyList())
            )
        }
    }
}
