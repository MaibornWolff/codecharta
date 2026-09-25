package de.maibornwolff.treesitter.excavationsite.languages.vue

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class VueExtractionTest {
    @Test
    fun `should extract function names from script section`() {
        // Arrange
        val code = """
            <template>
              <div>Hello</div>
            </template>
            <script>
            function handleClick() {
              console.log('clicked');
            }

            function handleHover() {
              console.log('hovered');
            }
            </script>
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.VUE)

        // Assert
        assertThat(result.identifiers).containsExactlyInAnyOrder("handleClick", "handleHover")
    }

    @Test
    fun `should extract method names from export default`() {
        // Arrange
        val code = """
            <script>
            export default {
              methods: {
                increment() {
                  this.count++;
                },
                decrement() {
                  this.count--;
                }
              }
            }
            </script>
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.VUE)

        // Assert
        assertThat(result.identifiers).containsExactlyInAnyOrder("increment", "decrement")
    }

    @Test
    fun `should extract comments from script section`() {
        // Arrange
        val code = """
            <script>
            // This is a line comment
            function foo() {
              /* This is a block comment */
              return 1;
            }
            </script>
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.VUE)

        // Assert
        assertThat(result.comments).containsExactlyInAnyOrder("This is a line comment", "This is a block comment")
    }

    @Test
    fun `should extract strings from script section`() {
        // Arrange
        val code = """
            <script>
            const message = "Hello, World!";
            const greeting = 'Welcome';
            </script>
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.VUE)

        // Assert
        assertThat(result.strings).containsExactlyInAnyOrder("Hello, World!", "Welcome")
    }

    @Test
    fun `should extract variable names from script section`() {
        // Arrange
        val code = """
            <script>
            const count = 0;
            let name = "Vue";
            var legacy = true;
            </script>
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.VUE)

        // Assert
        assertThat(result.identifiers).containsExactlyInAnyOrder("count", "name", "legacy")
    }

    @Test
    fun `should return empty result for Vue file with no script section`() {
        // Arrange
        val code = """
            <template>
              <div>Hello</div>
            </template>
            <style>
            div { color: red; }
            </style>
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.VUE)

        // Assert
        assertThat(result.identifiers).isEmpty()
        assertThat(result.comments).isEmpty()
        assertThat(result.strings).isEmpty()
    }

    @Test
    fun `should extract from script setup syntax`() {
        // Arrange
        val code = """
            <script setup>
            import { ref } from 'vue'

            const count = ref(0)

            function increment() {
              count.value++
            }
            </script>
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.VUE)

        // Assert
        assertThat(result.identifiers).containsExactlyInAnyOrder("count", "increment")
    }

    @Test
    fun `should extract class names from script section`() {
        // Arrange
        val code = """
            <script>
            class MyComponent {
              constructor() {
                this.data = [];
              }

              getData() {
                return this.data;
              }
            }
            </script>
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.VUE)

        // Assert
        assertThat(result.identifiers).containsExactlyInAnyOrder("MyComponent", "getData")
    }

    @Test
    fun `should extract arrow function variable names`() {
        // Arrange
        val code = """
            <script>
            const handleClick = () => {
              console.log('clicked');
            }

            const handleSubmit = (event) => {
              event.preventDefault();
            }
            </script>
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.VUE)

        // Assert
        assertThat(result.identifiers).containsExactlyInAnyOrder("handleClick", "handleSubmit")
    }

    @Test
    fun `should extract object destructuring identifiers`() {
        // Arrange
        val code = """
            <script>
            const { name, age } = person;
            </script>
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.VUE)

        // Assert
        assertThat(result.identifiers).containsExactlyInAnyOrder("name", "age")
    }

    @Test
    fun `should extract array destructuring identifiers`() {
        // Arrange
        val code = """
            <script>
            const [first, second] = array;
            </script>
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.VUE)

        // Assert
        assertThat(result.identifiers).containsExactlyInAnyOrder("first", "second")
    }

    @Test
    fun `should extract for-of loop variable`() {
        // Arrange
        val code = """
            <script>
            for (const item of items) { }
            </script>
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.VUE)

        // Assert
        assertThat(result.identifiers).containsExactlyInAnyOrder("item")
    }

    @Test
    fun `should extract for-in loop variable`() {
        // Arrange
        val code = """
            <script>
            for (const key in object) { }
            </script>
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.VUE)

        // Assert
        assertThat(result.identifiers).containsExactlyInAnyOrder("key")
    }

    @Test
    fun `should extract getter name`() {
        // Arrange
        val code = """
            <script>
            class User {
                get name() { return this._name; }
            }
            </script>
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.VUE)

        // Assert
        assertThat(result.identifiers).containsExactlyInAnyOrder("User", "name")
    }

    @Test
    fun `should extract setter name`() {
        // Arrange
        val code = """
            <script>
            class User {
                set name(value) { this._name = value; }
            }
            </script>
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.VUE)

        // Assert
        assertThat(result.identifiers).containsExactlyInAnyOrder("User", "name")
    }

    @Test
    fun `should extract catch clause variable`() {
        // Arrange
        val code = """
            <script>
            try { } catch (error) { console.log(error); }
            </script>
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.VUE)

        // Assert
        assertThat(result.identifiers).containsExactlyInAnyOrder("error")
    }

    @Test
    fun `should extract template string`() {
        // Arrange
        val code = """
            <script>
            const message = `Hello World`;
            </script>
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.VUE)

        // Assert
        assertThat(result.strings).containsExactlyInAnyOrder("Hello World")
    }

    @Test
    fun `should extract private field name`() {
        // Arrange
        val code = """
            <script>
            class User {
                #id;
                #name = "default";
            }
            </script>
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.VUE)

        // Assert
        assertThat(result.identifiers).containsExactlyInAnyOrder("User", "id", "name")
    }

    @Test
    fun `should extract generator function identifier`() {
        // Arrange
        val code = """
            <script>
            function* idGenerator() { yield 1; }
            </script>
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.VUE)

        // Assert
        assertThat(result.identifiers).containsExactlyInAnyOrder("idGenerator")
    }

    @Test
    fun `should extract rest parameter in function`() {
        // Arrange
        val code = """
            <script>
            function sum(...numbers) { }
            </script>
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.VUE)

        // Assert
        assertThat(result.identifiers).containsExactlyInAnyOrder("sum", "numbers")
    }

    @Test
    fun `should extract function parameter destructuring`() {
        // Arrange
        val code = """
            <script>
            function process({ id, data }) { }
            </script>
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.VUE)

        // Assert
        assertThat(result.identifiers).containsExactlyInAnyOrder("process", "id", "data")
    }

    @Test
    fun `should handle empty source code in script`() {
        // Arrange
        val code = """
            <script>
            </script>
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.VUE)

        // Assert
        assertThat(result.identifiers).isEmpty()
        assertThat(result.comments).isEmpty()
        assertThat(result.strings).isEmpty()
    }

    @Test
    fun `should extract static method name`() {
        // Arrange
        val code = """
            <script>
            class Math {
                static sqrt(x) { return x; }
            }
            </script>
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.VUE)

        // Assert
        assertThat(result.identifiers).containsExactlyInAnyOrder("Math", "sqrt")
    }

    @Test
    fun `should extract static field name`() {
        // Arrange
        val code = """
            <script>
            class Math {
                static PI = 3.14159;
            }
            </script>
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.VUE)

        // Assert
        assertThat(result.identifiers).containsExactlyInAnyOrder("Math", "PI")
    }
}
