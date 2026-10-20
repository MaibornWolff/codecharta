package de.maibornwolff.treesitter.excavationsite.languages.javascript

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class JavascriptBindingExtractionTest {
    @Nested
    inner class DestructuringTests {
        @Test
        fun `should extract object destructuring identifiers`() {
            // Arrange
            val code = "const { name, age } = person;"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("name", "age")
        }

        @Test
        fun `should extract array destructuring identifiers`() {
            // Arrange
            val code = "const [first, second] = array;"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("first", "second")
        }

        @Test
        fun `should extract nested object destructuring`() {
            // Arrange
            val code = "const { user: { name, email } } = response;"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("name", "email")
        }

        @Test
        fun `should extract mixed destructuring`() {
            // Arrange
            val code = "const { items: [first, second] } = data;"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("first", "second")
        }

        @Test
        fun `should extract destructuring with default values`() {
            // Arrange
            val code = "const { name = 'default', age = 0 } = config;"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("name", "age")
        }

        @Test
        fun `should extract destructuring with renaming`() {
            // Arrange
            val code = "const { name: userName, age: userAge } = person;"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("userName", "userAge")
        }

        @Test
        fun `should extract function parameter destructuring`() {
            // Arrange
            val code = "function process({ id, data }) { }"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("process", "id", "data")
        }

        @Test
        fun `should extract arrow function parameter destructuring`() {
            // Arrange
            val code = "const handler = ({ event, target }) => { };"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("handler", "event", "target")
        }
    }

    @Nested
    inner class ForLoopTests {
        @Test
        fun `should extract for-of loop variable`() {
            // Arrange
            val code = "for (const item of items) { }"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("item")
        }

        @Test
        fun `should extract for-in loop variable`() {
            // Arrange
            val code = "for (const key in object) { }"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("key")
        }

        @Test
        fun `should extract for-of with destructuring`() {
            // Arrange
            val code = "for (const { name, age } of people) { }"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("name", "age")
        }

        @Test
        fun `should extract for-of with array destructuring`() {
            // Arrange
            val code = "for (const [key, value] of entries) { }"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("key", "value")
        }
    }

    @Nested
    inner class RestPatternTests {
        @Test
        fun `should extract rest parameter in function`() {
            // Arrange
            val code = "function sum(...numbers) { }"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("sum", "numbers")
        }

        @Test
        fun `should extract rest element in array destructuring`() {
            // Arrange
            val code = "const [first, ...rest] = array;"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("first", "rest")
        }

        @Test
        fun `should extract rest element in object destructuring`() {
            // Arrange
            val code = "const { id, ...remaining } = obj;"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("id", "remaining")
        }
    }

    @Nested
    inner class CatchClauseTests {
        @Test
        fun `should extract catch clause variable`() {
            // Arrange
            val code = "try { } catch (error) { console.log(error); }"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("error")
        }

        @Test
        fun `should extract catch clause with destructuring`() {
            // Arrange
            val code = "try { } catch ({ message, code }) { }"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("message", "code")
        }

        @Test
        fun `should extract typescript typed catch clause`() {
            // Arrange
            val code = "try { } catch (error: unknown) { }"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.TYPESCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("error")
        }
    }

    @Nested
    inner class EdgeCaseTests {
        @Test
        fun `should handle empty object destructuring`() {
            val code = "const {} = obj;"
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)
            assertThat(result.identifiers).isEmpty()
        }

        @Test
        fun `should handle empty array destructuring`() {
            val code = "const [] = arr;"
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)
            assertThat(result.identifiers).isEmpty()
        }

        @Test
        fun `should handle deeply nested destructuring`() {
            val code = "const { a: { b: { c: { d } } } } = obj;"
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)
            assertThat(result.identifiers).containsExactly("d")
        }

        @Test
        fun `should handle destructuring with skipped elements`() {
            val code = "const [, second, , fourth] = arr;"
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)
            assertThat(result.identifiers).containsExactly("second", "fourth")
        }

        @Test
        fun `should handle rest with preceding destructured elements`() {
            val code = "const { a, b, ...rest } = obj;"
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)
            assertThat(result.identifiers).containsExactly("a", "b", "rest")
        }

        @Test
        fun `should extract for-of with let`() {
            val code = "for (let item of items) { }"
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)
            assertThat(result.identifiers).containsExactly("item")
        }

        @Test
        fun `should extract for-of with var`() {
            val code = "for (var item of items) { }"
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)
            assertThat(result.identifiers).containsExactly("item")
        }

        @Test
        fun `should handle nested for-of loops`() {
            val code = """
                for (const outer of outerList) {
                    for (const inner of innerList) { }
                }
            """.trimIndent()
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)
            assertThat(result.identifiers).containsExactly("outer", "inner")
        }

        @Test
        fun `should handle arrow function with destructuring parameter`() {
            val code = "const fn = ({ a, b }) => a + b;"
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)
            assertThat(result.identifiers).containsExactly("fn", "a", "b")
        }

        @Test
        fun `should handle arrow function with rest parameter - expression body`() {
            val code = "const fn = (...args) => args;"
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)
            assertThat(result.identifiers).containsExactly("fn", "args")
        }

        @Test
        fun `should handle arrow function with rest parameter - block body`() {
            val code = "const fn = (...args) => { return args; };"
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)
            assertThat(result.identifiers).containsExactly("fn", "args")
        }

        @Test
        fun `should handle function with mixed parameter types`() {
            val code = "function process(a, { b, c }, [d, e], ...rest) { }"
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)
            assertThat(result.identifiers).containsExactly("process", "b", "c", "d", "e", "rest")
        }

        @Test
        fun `should handle async function with destructuring`() {
            val code = "async function fetch({ url, method }) { }"
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)
            assertThat(result.identifiers).containsExactly("fetch", "url", "method")
        }

        @Test
        fun `should handle nested try-catch`() {
            val code = """
                try {
                    try { } catch (inner) { }
                } catch (outer) { }
            """.trimIndent()
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)
            assertThat(result.identifiers).containsExactly("inner", "outer")
        }

        @Test
        fun `should handle catch without parameter`() {
            // ES2019+ optional catch binding
            val code = "try { } catch { console.log('error'); }"
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)
            assertThat(result.identifiers).isEmpty()
        }

        @Test
        fun `should handle try-catch-finally`() {
            val code = "try { } catch (err) { } finally { }"
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)
            assertThat(result.identifiers).containsExactly("err")
        }
    }
}
