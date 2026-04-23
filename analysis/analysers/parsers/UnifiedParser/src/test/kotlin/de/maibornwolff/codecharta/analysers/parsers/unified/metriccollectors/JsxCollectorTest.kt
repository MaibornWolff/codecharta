package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.treesitter.excavationsite.api.AvailableFileMetrics
import de.maibornwolff.treesitter.excavationsite.api.Language
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.io.File

class JsxCollectorTest {
    private val collector = TreeSitterLibraryCollector(Language.JAVASCRIPT)

    private fun createTestFile(content: String): File {
        val tempFile = File.createTempFile("testFile", ".jsx")
        tempFile.writeText(content)
        tempFile.deleteOnExit()
        return tempFile
    }

    @Test
    fun `should parse a minimal JSX component and return non-zero loc`() {
        // Arrange
        val fileContent = """
            function Hello() {
                return <div>Hello World</div>;
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        assertThat(result.attributes[AvailableFileMetrics.LINES_OF_CODE.metricName] as Double).isGreaterThan(0.0)
        assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName] as Double).isEqualTo(1.0)
    }

    @Test
    fun `should count ternary operator inside JSX expression for complexity`() {
        // Arrange
        val fileContent = """const element = (<h1>{x < 10 ? "Banana" : "Apple"}</h1>);"""
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should count logical AND short-circuit in JSX expression for complexity`() {
        // Arrange
        val fileContent = """const element = (<div>{isLoggedIn && <Dashboard />}</div>);"""
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should not count inline arrow function in JSX prop as a function`() {
        // Arrange
        val fileContent = """
            function App() {
                return (<Button onClick={() => doStuff()} />);
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should count arrow function component assigned to const as a function`() {
        // Arrange
        val fileContent = """
            const Fruit = () => (
                <div>Hello</div>
            );
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should not count map callback returning JSX as a function`() {
        // Arrange
        val fileContent = """
            function List({ items }) {
                return (<ul>{items.map((item) => <li key={item.id}>{item.name}</li>)}</ul>);
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should count JSX block comment in comment lines`() {
        // Arrange
        val fileContent = """
            function App() {
                return (
                    <div>
                        {/* this is a JSX comment */}
                        <p>Hello</p>
                    </div>
                );
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        assertThat(result.attributes[AvailableFileMetrics.COMMENT_LINES.metricName]).isEqualTo(1.0)
    }
}
