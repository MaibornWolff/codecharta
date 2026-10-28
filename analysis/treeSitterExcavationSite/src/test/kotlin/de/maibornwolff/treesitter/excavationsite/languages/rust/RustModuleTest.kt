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

    @Nested
    inner class Paths {
        private fun pathsOf(code: String, item: String) =
            moduleOf(code).items.single { it.name == item }.paths.map { it.segments.joinToString("::") to it.namespace }

        @Test
        fun `should write the types of a signature and leave out generic parameters and Self`() {
            // Arrange
            val code = """
                pub fn hit<T: Fightable>(target: &T, dice: Vec<model::Dice>) -> Option<Self> where T: Copy { None }
            """

            // Act
            val paths = pathsOf(code, "hit")

            // Assert
            assertThat(paths).containsExactlyInAnyOrder(
                "Fightable" to RustNamespace.TYPE,
                "Vec" to RustNamespace.TYPE,
                "model::Dice" to RustNamespace.TYPE,
                "Option" to RustNamespace.TYPE,
                "Copy" to RustNamespace.TYPE,
                "None" to RustNamespace.VALUE
            )
        }

        @Test
        fun `should write the paths of a body by the namespace they are looked up in`() {
            // Arrange
            val code = """
                fn fight() {
                    let dice: Dice = roll_d20();
                    let boss = Creature::new();
                    let den = Den { depth: MAX };
                    let speeds = Vec::<Speed>::new();
                    boss.attack();
                    dice.sides;
                }
            """

            // Act
            val paths = pathsOf(code, "fight")

            // Assert
            assertThat(paths).containsExactlyInAnyOrder(
                "Dice" to RustNamespace.TYPE,
                "roll_d20" to RustNamespace.VALUE,
                "Creature::new" to RustNamespace.VALUE,
                "Den" to RustNamespace.TYPE,
                "MAX" to RustNamespace.VALUE,
                "Vec" to RustNamespace.TYPE,
                "Speed" to RustNamespace.TYPE,
                "Vec::new" to RustNamespace.VALUE
            )
        }

        @Test
        fun `should leave out the names that parameters, let, closures, match arms and for loops bind`() {
            // Arrange
            val code = """
                fn rule(roll: u8, herd: Vec<u8>) -> u8 {
                    let total = roll + 1;
                    let check = |value: u8| value + total;
                    for creature in herd.iter() { check(*creature); }
                    match roll {
                        MAX => 1,
                        other => other,
                    }
                }
            """

            // Act
            val paths = pathsOf(code, "rule")

            // Assert
            assertThat(paths).containsExactlyInAnyOrder("Vec" to RustNamespace.TYPE, "MAX" to RustNamespace.VALUE)
        }

        @Test
        fun `should read a destructuring pattern as the struct or variant it names and bind its fields`() {
            // Arrange
            val code = """
                fn dig(outcome: u8) -> u8 {
                    let Den { depth } = make();
                    if let Outcome::Slain(id) = outcome { return id; }
                    depth
                }
            """

            // Act
            val paths = pathsOf(code, "dig")

            // Assert
            assertThat(paths).containsExactlyInAnyOrder(
                "make" to RustNamespace.VALUE,
                "Den" to RustNamespace.TYPE,
                "Outcome::Slain" to RustNamespace.VALUE
            )
        }

        @Test
        fun `should leave out the items of a block and write a name a block use imports as its path`() {
            // Arrange
            val code = """
                fn spawn() {
                    use crate::model::Creature;
                    use crate::dice::*;
                    struct Local;
                    fn pace(_speed: Speed) {}
                    let _boss = Creature;
                    let _local = Local;
                    pace(roll());
                }
            """

            // Act
            val paths = moduleOf(code).items.single().paths

            // Assert
            assertThat(paths.map { it.segments }).containsExactlyInAnyOrder(
                listOf("Speed"),
                listOf("crate", "model", "Creature"),
                listOf("roll")
            )
            assertThat(paths.single { it.segments == listOf("roll") }.blockGlobs).containsExactly(listOf("crate", "dice"))
        }

        @Test
        fun `should write a macro invocation as a macro path and read the paths of its arguments`() {
            // Arrange
            val code = """
                fn check(herd: Vec<u8>) {
                    let count = 3;
                    assert_eq!(roll_d20(), MAX + count);
                    let boss = vec![Creature::new(), herd.len()];
                    crate::log!("{}", self.name);
                }
            """

            // Act
            val paths = pathsOf(code, "check")

            // Assert
            assertThat(paths).containsExactlyInAnyOrder(
                "Vec" to RustNamespace.TYPE,
                "assert_eq" to RustNamespace.MACRO,
                "roll_d20" to RustNamespace.ANY,
                "MAX" to RustNamespace.ANY,
                "vec" to RustNamespace.MACRO,
                "Creature::new" to RustNamespace.ANY,
                "crate::log" to RustNamespace.MACRO
            )
        }

        @Test
        fun `should write the paths of a qualified path and of a trait method called by path`() {
            // Arrange
            val code = """
                fn first() -> u8 { <Creature as Fightable>::attack(&Creature) + Fightable::attack(&Creature) }
            """

            // Act
            val paths = pathsOf(code, "first")

            // Assert
            assertThat(paths).containsExactlyInAnyOrder(
                "Creature" to RustNamespace.TYPE,
                "Fightable" to RustNamespace.TYPE,
                "Creature" to RustNamespace.VALUE,
                "Fightable::attack" to RustNamespace.VALUE,
                "Creature" to RustNamespace.VALUE
            )
        }

        @Test
        fun `should write what an impl names in its header and its methods`() {
            // Arrange
            val code = """
                impl<T: Identified> Fightable for Repository<T> {
                    fn attack(&self) -> Speed { Speed::new() }
                }
            """

            // Act
            val paths = moduleOf(code).impls.single().paths.map { it.segments.joinToString("::") }

            // Assert
            assertThat(paths).containsExactlyInAnyOrder("Identified", "Fightable", "Repository", "Speed", "Speed::new")
        }

        @Test
        fun `should write no path for a macro_rules body`() {
            // Arrange
            val code = "macro_rules! spawn { () => { crate::model::Creature } }"

            // Act
            val paths = moduleOf(code).items.single().paths

            // Assert
            assertThat(paths).isEmpty()
        }
    }
}
