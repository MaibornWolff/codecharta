package de.maibornwolff.treesitter.excavationsite.languages.vue

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterMetrics
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class VueMetricsTest {
    @Test
    fun `should count if statements for complexity`() {
        // Arrange
        val code = """
            <template>
              <div>Hello</div>
            </template>
            <script>
            function foo() {
              if (x > 0) {
                return x;
              }
            }
            </script>
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.VUE)

        // Assert
        assertThat(result.complexity).isEqualTo(2.0) // 1 for function + 1 for if
    }

    @Test
    fun `should count for loop for complexity`() {
        // Arrange
        val code = """
            <script>
            function process() {
              for (let i = 0; i < 10; i++) {
                console.log(i);
              }
            }
            </script>
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.VUE)

        // Assert
        assertThat(result.complexity).isEqualTo(2.0) // 1 for function + 1 for for
    }

    @Test
    fun `should count while loop for complexity`() {
        // Arrange
        val code = """
            <script>
            function loop() {
              while (true) {
                break;
              }
            }
            </script>
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.VUE)

        // Assert
        assertThat(result.complexity).isEqualTo(2.0) // 1 for function + 1 for while
    }

    @Test
    fun `should count ternary operator for complexity`() {
        // Arrange
        val code = """
            <script>
            const result = x > 0 ? 1 : -1;
            </script>
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.VUE)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count logical operators for complexity`() {
        // Arrange
        val code = """
            <script>
            function check() {
              if (x > 0 && y > 0) {
                return true;
              }
            }
            </script>
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.VUE)

        // Assert
        assertThat(result.complexity).isEqualTo(3.0) // 1 for function + 1 for if + 1 for &&
    }

    @Test
    fun `should count function declarations for number of functions`() {
        // Arrange
        val code = """
            <script>
            function foo() {}
            function bar() {}
            </script>
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.VUE)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(2.0)
    }

    @Test
    fun `should count method definitions in export default for number of functions`() {
        // Arrange
        val code = """
            <script>
            export default {
              methods: {
                handleClick() {
                  console.log('clicked');
                },
                handleHover() {
                  console.log('hovered');
                }
              }
            }
            </script>
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.VUE)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(2.0)
    }

    @Test
    fun `should count comments for comment lines`() {
        // Arrange
        val code = """
            <script>
            // This is a comment
            function foo() {
              /* Block comment */
              return 1;
            }
            </script>
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.VUE)

        // Assert
        assertThat(result.commentLines).isEqualTo(2.0)
    }

    @Test
    fun `should count lines of code for script section only`() {
        // Arrange
        val code = """
            <template>
              <div>Hello</div>
            </template>
            <script>
            function foo() {
              return 1;
            }
            </script>
            <style>
            div { color: red; }
            </style>
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.VUE)

        // Assert - script content is 3 lines: function foo(), return 1;, }
        assertThat(result.linesOfCode).isEqualTo(3.0)
    }

    @Test
    fun `should handle Vue file with no script section`() {
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
        val result = TreeSitterMetrics.parse(code, Language.VUE)

        // Assert
        assertThat(result.complexity).isEqualTo(0.0)
        assertThat(result.numberOfFunctions).isEqualTo(0.0)
        assertThat(result.linesOfCode).isEqualTo(0.0) // Empty script content has 0 lines
    }

    @Test
    fun `should handle arrow functions assigned to variables`() {
        // Arrange
        val code = """
            <script>
            const handler = () => {
              console.log('handled');
            }
            </script>
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.VUE)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(1.0)
    }

    @Test
    fun `should count switch cases for complexity`() {
        // Arrange
        val code = """
            <script>
            function test(value) {
              switch (value) {
                case 1:
                  return 'one';
                case 2:
                  return 'two';
                default:
                  return 'other';
              }
            }
            </script>
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.VUE)

        // Assert
        assertThat(result.complexity).isEqualTo(4.0) // 1 function + 2 cases + 1 default
    }

    @Test
    fun `should detect message chains`() {
        // Arrange
        val code = """
            <script>
            const result = obj.a().b().c().d();
            </script>
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.VUE)

        // Assert
        assertThat(result.messageChains).isEqualTo(1.0)
    }

    @Test
    fun `should handle script setup syntax`() {
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
        val result = TreeSitterMetrics.parse(code, Language.VUE)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(1.0)
    }

    @Test
    fun `should count for in loop for complexity`() {
        // Arrange
        val code = """
            <script>
            for (let x in person) {
              text += person[x];
            }
            </script>
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.VUE)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count nullish operator for complexity`() {
        // Arrange
        val code = """
            <script>
            const x = y ?? 0;
            </script>
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.VUE)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should not include comments or empty lines for rloc`() {
        // Arrange
        val code = """
            <script>
            if (x == 2) {
                // comment


                return true
            }
            </script>
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.VUE)

        // Assert
        assertThat(result.realLinesOfCode).isEqualTo(3.0)
    }

    @Test
    fun `should count generator function declaration for number of functions`() {
        // Arrange
        val code = """
            <script>
            function* generator() {
                yield 1;
            }
            </script>
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.VUE)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(1.0)
    }

    @Test
    fun `should count function expression for number of functions`() {
        // Arrange
        val code = """
            <script>
            const fun_expr = function (expression) {
                console.log("This is a function expression:" + expression);
            }
            </script>
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.VUE)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(1.0)
    }

    @Test
    fun `should not count inline arrow functions for number of functions`() {
        // Arrange
        val code = """
            <script>
            const tester = (content) => {
                console.log("Logging" + content)
            }

            // inline arrow function (should not be counted)
            const x = ["a", "b", "c"]
            x.map((it) => {console.log(it)})
            </script>
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.VUE)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(1.0)
    }

    @Test
    fun `should count method definitions in class for number of functions`() {
        // Arrange
        val code = """
            <script>
            class TestClass {
                method() {
                    console.log("This is a method")
                }

                // should not count static block in class
                static {
                    console.log("this is a static block")
                }
            }
            </script>
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.VUE)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(1.0)
    }

    @Test
    fun `should correctly calculate all measures for parameters per function metric`() {
        // Arrange
        val code = """
            <script>
            function printSomething() {
                console.log("Something");
            }

            function anotherFun(a, b) {
                return a + b;
            }

            function power(x, y) {
                return x ** y;
            }

            function oneParameter(x) {
                return x * 2;
            }
            </script>
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.VUE)

        // Assert
        assertThat(result.perFunctionMetrics["max_parameters_per_function"]).isEqualTo(2.0)
        assertThat(result.perFunctionMetrics["min_parameters_per_function"]).isEqualTo(0.0)
        assertThat(result.perFunctionMetrics["mean_parameters_per_function"]).isEqualTo(1.25)
        assertThat(result.perFunctionMetrics["median_parameters_per_function"]).isEqualTo(1.5)
    }

    @Test
    fun `should correctly calculate all measures for complexity per function metric`() {
        // Arrange
        val code = """
            <script>
            function noComplexity() {
                console.log("hello");
            }

            function complexFun(a, b) {
                switch (true) {
                    case (a * b > 10):
                        break;
                    case ((a + b) % 2 === 0):
                        console.log("Sum is even");
                        break;
                    default:
                        return;
                }
            }

            function isEven(x) {
                return (x % 2 === 0) ? true : false;
            }
            </script>
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.VUE)

        // Assert
        assertThat(result.perFunctionMetrics["max_complexity_per_function"]).isEqualTo(3.0)
        assertThat(result.perFunctionMetrics["min_complexity_per_function"]).isEqualTo(0.0)
        assertThat(result.perFunctionMetrics["mean_complexity_per_function"]).isEqualTo(1.33)
        assertThat(result.perFunctionMetrics["median_complexity_per_function"]).isEqualTo(1.0)
    }

    @Test
    fun `should correctly calculate rloc per function metric`() {
        // Arrange
        val code = """
            <script>
            function functionOne() {
            // comment at start of function
                console.log("This is function one");
                // inline comment
                {}
            }

            function functionTwo(x) {
                return x * 2;
            }
            </script>
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.VUE)

        // Assert
        assertThat(result.perFunctionMetrics["max_rloc_per_function"]).isEqualTo(2.0)
        assertThat(result.perFunctionMetrics["min_rloc_per_function"]).isEqualTo(1.0)
        assertThat(result.perFunctionMetrics["mean_rloc_per_function"]).isEqualTo(1.5)
        assertThat(result.perFunctionMetrics["median_rloc_per_function"]).isEqualTo(1.5)
    }

    @Test
    fun `should count LOC correctly for code without trailing newline`() {
        // Arrange - Vue file with 2-line script content
        val code = """
            <script>
            const a = 1;
            const b = 2;
            </script>
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.VUE)

        // Assert - Vue counts only script section lines (2 lines: const a, const b)
        // LOC equals RLOC for code without blanks or comments
        assertThat(result.linesOfCode).isEqualTo(2.0)
        assertThat(result.realLinesOfCode).isEqualTo(2.0)
    }
}
