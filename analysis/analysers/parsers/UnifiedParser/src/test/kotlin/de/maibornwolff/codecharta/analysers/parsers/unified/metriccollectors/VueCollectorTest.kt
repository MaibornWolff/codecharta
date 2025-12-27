package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.treesitter.excavationsite.api.AvailableFileMetrics
import de.maibornwolff.treesitter.excavationsite.api.Language
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.io.File

class VueCollectorTest {
    private val collector = TreeSitterLibraryCollector(Language.VUE)

    private fun createTestFile(content: String): File {
        val tempFile = File.createTempFile("testFile", ".vue")
        tempFile.writeText(content)
        tempFile.deleteOnExit()
        return tempFile
    }

    @Test
    fun `should count functions in script section`() {
        // given
        val fileContent = """
            <script>
            export default {
                methods: {
                    handleClick() {
                        console.log('clicked');
                    },
                    fetchData() {
                        return fetch('/api/data');
                    }
                }
            };
            </script>
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        val numberOfFunctions = result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName] as Double
        assertThat(numberOfFunctions).isGreaterThanOrEqualTo(2.0)
    }

    @Test
    fun `should count complexity for conditionals in script`() {
        // given
        val fileContent = """
            <script>
            export default {
                computed: {
                    displayName() {
                        if (this.firstName && this.lastName) {
                            return this.firstName + ' ' + this.lastName;
                        } else if (this.name) {
                            return this.name;
                        }
                        return 'Unknown';
                    }
                }
            };
            </script>
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        val complexity = result.attributes[AvailableFileMetrics.COMPLEXITY.metricName] as Double
        assertThat(complexity).isGreaterThanOrEqualTo(2.0)
    }

    @Test
    fun `should count lines of code including template and style sections`() {
        // given
        val fileContent = """
            <template>
              <div>Hello</div>
            </template>
            <script>
            export default {
                name: 'HelloWorld'
            };
            </script>
            <style>
            div { color: red; }
            </style>
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        val loc = result.attributes[AvailableFileMetrics.LINES_OF_CODE.metricName] as Double
        assertThat(loc).isGreaterThan(0.0)
    }

    @Test
    fun `should count comments in script section`() {
        // given
        val fileContent = """
            <script>
            /**
             * A component that displays a greeting
             */
            export default {
                // component name
                name: 'Greeting',
                methods: {
                    /* greeting method */
                    greet() {
                        return 'Hello';
                    }
                }
            };
            </script>
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        val commentLines = result.attributes[AvailableFileMetrics.COMMENT_LINES.metricName] as Double
        assertThat(commentLines).isGreaterThanOrEqualTo(3.0)
    }
}
