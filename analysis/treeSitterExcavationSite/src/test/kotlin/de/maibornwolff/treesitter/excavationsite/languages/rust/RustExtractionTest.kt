package de.maibornwolff.treesitter.excavationsite.languages.rust

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class RustExtractionTest {
    private fun extract(code: String) = TreeSitterExtraction.extract(code.trimIndent(), Language.RUST)

    @Nested
    inner class IdentifierExtraction {
        @Test
        fun `should extract function name`() {
            // Arrange
            val code = "fn add(a: i32, b: i32) {}"

            // Act
            val result = extract(code)

            // Assert
            assertThat(result.identifiers).containsExactly("add", "a", "b")
        }

        @Test
        fun `should extract struct name and field names`() {
            // Arrange
            val code = """
                struct Rectangle {
                    width: f64,
                    height: f64,
                }
            """

            // Act
            val result = extract(code)

            // Assert
            assertThat(result.identifiers).containsExactly("Rectangle", "width", "height")
        }

        @Test
        fun `should extract enum name and variant names`() {
            // Arrange
            val code = """
                enum Color {
                    Red,
                    Green,
                    Custom(u8, u8, u8),
                }
            """

            // Act
            val result = extract(code)

            // Assert
            assertThat(result.identifiers).containsExactly("Color", "Red", "Green", "Custom")
        }

        @Test
        fun `should extract union name and field names`() {
            // Arrange
            val code = """
                union Number {
                    integer: i64,
                    floating: f64,
                }
            """

            // Act
            val result = extract(code)

            // Assert
            assertThat(result.identifiers).containsExactly("Number", "integer", "floating")
        }

        @Test
        fun `should extract trait name and method signature names`() {
            // Arrange
            val code = """
                trait Drawable {
                    fn area(&self) -> f64;
                    fn describe(&self) -> String;
                }
            """

            // Act
            val result = extract(code)

            // Assert
            assertThat(result.identifiers).containsExactly("Drawable", "area", "describe")
        }

        @Test
        fun `should extract type alias name`() {
            // Arrange
            val code = "type ShapeMap = HashMap<String, Rectangle>;"

            // Act
            val result = extract(code)

            // Assert
            assertThat(result.identifiers).containsExactly("ShapeMap")
        }

        @Test
        fun `should extract const and static names`() {
            // Arrange
            val code = """
                const MAX_RETRIES: u32 = 3;
                static GREETING: &str = "hi";
            """

            // Act
            val result = extract(code)

            // Assert
            assertThat(result.identifiers).containsExactly("MAX_RETRIES", "GREETING")
        }

        @Test
        fun `should extract module name`() {
            // Arrange
            val code = """
                mod geometry {
                    const PI: f64 = 3.14;
                }
            """

            // Act
            val result = extract(code)

            // Assert
            assertThat(result.identifiers).containsExactly("geometry", "PI")
        }

        @Test
        fun `should extract macro definition name`() {
            // Arrange
            val code = """
                macro_rules! square {
                    (${'$'}x:expr) => { ${'$'}x * ${'$'}x };
                }
            """

            // Act
            val result = extract(code)

            // Assert
            assertThat(result.identifiers).containsExactly("square")
        }

        @Test
        fun `should extract simple let binding`() {
            // Arrange
            val code = """
                fn f() {
                    let result = compute();
                }
            """

            // Act
            val result = extract(code)

            // Assert
            assertThat(result.identifiers).containsExactly("f", "result")
        }

        @Test
        fun `should extract mutable let binding`() {
            // Arrange
            val code = """
                fn f() {
                    let mut counter = 0;
                }
            """

            // Act
            val result = extract(code)

            // Assert
            assertThat(result.identifiers).containsExactly("f", "counter")
        }

        @Test
        fun `should extract only the binding name from a type-annotated let`() {
            // Arrange - the scoped type path segments (std, collections) must not leak as identifiers
            val code = """
                fn f() {
                    let cache: std::collections::HashMap<String, i32> = build();
                }
            """

            // Act
            val result = extract(code)

            // Assert
            assertThat(result.identifiers).containsExactly("f", "cache")
        }

        @Test
        fun `should extract tuple destructuring let binding`() {
            // Arrange
            val code = """
                fn f() {
                    let (a, b) = (1, 2);
                }
            """

            // Act
            val result = extract(code)

            // Assert
            assertThat(result.identifiers).containsExactly("f", "a", "b")
        }

        @Test
        fun `should extract generic type parameters without their trait bounds`() {
            // Arrange
            val code = "fn longest<T, U: Clone>(x: T) -> T { x }"

            // Act
            val result = extract(code)

            // Assert - T and U are declarations; Clone is a bound (type reference), not a declaration
            assertThat(result.identifiers).containsExactlyInAnyOrder("longest", "T", "U", "x")
        }

        @Test
        fun `should extract const generic parameter without its type`() {
            // Arrange
            val code = "struct Wrapper<const N: usize> { items: u8 }"

            // Act
            val result = extract(code)

            // Assert - N is the const param name; usize is a type, not a declaration
            assertThat(result.identifiers).containsExactlyInAnyOrder("Wrapper", "N", "items")
        }

        @Test
        fun `should extract both typed and untyped closure parameters`() {
            // Arrange
            val code = """
                fn f() {
                    let add = |x: i32, y| x + y;
                }
            """

            // Act
            val result = extract(code)

            // Assert
            assertThat(result.identifiers).containsExactlyInAnyOrder("f", "add", "x", "y")
        }

        @Test
        fun `should extract shorthand struct destructuring let binding`() {
            // Arrange
            val code = """
                fn f() {
                    let Point { x, y } = p;
                }
            """

            // Act
            val result = extract(code)

            // Assert - the struct path Point is a type reference, not a binding
            assertThat(result.identifiers).containsExactlyInAnyOrder("f", "x", "y")
        }

        @Test
        fun `should extract renamed struct destructuring binding only`() {
            // Arrange
            val code = """
                fn g() {
                    let Point { x: px, y: py } = q;
                }
            """

            // Act
            val result = extract(code)

            // Assert - the matched field names x and y are not bindings; only px and py are
            assertThat(result.identifiers).containsExactlyInAnyOrder("g", "px", "py")
        }

        @Test
        fun `should not extract the constructor from a let-else tuple struct pattern`() {
            // Arrange
            val code = """
                fn f() {
                    let Some(inner) = opt else { return; };
                }
            """

            // Act
            val result = extract(code)

            // Assert - Some is the variant/constructor; only inner is a binding
            assertThat(result.identifiers).containsExactlyInAnyOrder("f", "inner")
        }

        @Test
        fun `should not extract impl target type as a separate identifier`() {
            // Arrange - Rectangle is declared by the struct; the impl block adds no new name
            val code = """
                struct Rectangle {}
                impl Rectangle {
                    fn new() -> Rectangle {}
                }
            """

            // Act
            val result = extract(code)

            // Assert - only the struct declaration and the method name, no extra Rectangle from impl
            assertThat(result.identifiers).containsExactly("Rectangle", "new")
        }
    }

    @Nested
    inner class CommentExtraction {
        @Test
        fun `should extract line comment`() {
            // Arrange
            val code = "// a normal comment"

            // Act
            val result = extract(code)

            // Assert
            assertThat(result.comments).containsExactly("a normal comment")
        }

        @Test
        fun `should extract outer doc comment`() {
            // Arrange
            val code = "/// documents the next item"

            // Act
            val result = extract(code)

            // Assert
            assertThat(result.comments).containsExactly("documents the next item")
        }

        @Test
        fun `should strip the bang marker from an inner doc comment`() {
            // Arrange
            val code = "//! module level doc"

            // Act
            val result = extract(code)

            // Assert
            assertThat(result.comments).containsExactly("module level doc")
        }

        @Test
        fun `should strip the bang marker from an inner block doc comment`() {
            // Arrange
            val code = "/*! module level block doc */"

            // Act
            val result = extract(code)

            // Assert
            assertThat(result.comments).containsExactly("module level block doc")
        }

        @Test
        fun `should extract block comment`() {
            // Arrange
            val code = "/* a block comment */"

            // Act
            val result = extract(code)

            // Assert
            assertThat(result.comments).containsExactly("a block comment")
        }

        @Test
        fun `should extract block doc comment stripping asterisks`() {
            // Arrange
            val code = """
                /**
                 * documents an item
                 */
                fn f() {}
            """

            // Act
            val result = extract(code)

            // Assert
            assertThat(result.comments).containsExactly("documents an item")
        }
    }

    @Nested
    inner class StringExtraction {
        @Test
        fun `should extract normal string content`() {
            // Arrange
            val code = """
                fn f() {
                    let s = "hello world";
                }
            """

            // Act
            val result = extract(code)

            // Assert
            assertThat(result.strings).containsExactly("hello world")
        }

        @Test
        fun `should extract full content of string with escape sequences`() {
            // Arrange
            val code = """
                fn f() {
                    let s = "line1\nline2";
                }
            """

            // Act
            val result = extract(code)

            // Assert - raw inner text is preserved, including content after the escape
            assertThat(result.strings).containsExactly("line1\\nline2")
        }

        @Test
        fun `should extract raw string content without delimiters`() {
            // Arrange
            val code = """
                fn f() {
                    let s = r#"a "raw" string"#;
                }
            """

            // Act
            val result = extract(code)

            // Assert
            assertThat(result.strings).containsExactly("a \"raw\" string")
        }

        @Test
        fun `should extract byte string content without the b prefix`() {
            // Arrange
            val code = """
                fn f() {
                    let a = b"bytes";
                    let c = br"raw bytes";
                }
            """

            // Act
            val result = extract(code)

            // Assert
            assertThat(result.strings).containsExactlyInAnyOrder("bytes", "raw bytes")
        }

        @Test
        fun `should extract char literal content`() {
            // Arrange
            val code = """
                fn f() {
                    let c = 'R';
                }
            """

            // Act
            val result = extract(code)

            // Assert
            assertThat(result.strings).containsExactly("R")
        }
    }
}
