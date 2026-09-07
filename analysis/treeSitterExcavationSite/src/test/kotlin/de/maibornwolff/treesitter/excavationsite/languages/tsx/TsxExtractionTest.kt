package de.maibornwolff.treesitter.excavationsite.languages.tsx

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class TsxExtractionTest {
    @Test
    fun `should extract function component name as identifier`() {
        // Arrange
        val code = """
            const Button = () => {
                return <button>Click</button>;
            };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.TSX)

        // Assert — "button" is extracted from jsx_opening_element (HTML element name is an identifier in JSX)
        assertThat(result.identifiers).containsExactlyInAnyOrder("Button", "button")
    }

    @Test
    fun `should extract class component name as identifier`() {
        // Arrange
        val code = """
            class MyComponent extends React.Component {
                render() {
                    return <div />;
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.TSX)

        // Assert — "div" is extracted from jsx_self_closing_element
        assertThat(result.identifiers).containsExactlyInAnyOrder("MyComponent", "render", "div")
    }

    @Test
    fun `should extract line comment text`() {
        // Arrange
        val code = """
            // renders a loading spinner
            const Spinner = () => <div className="spinner" />;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.TSX)

        // Assert
        assertThat(result.comments).containsExactlyInAnyOrder("renders a loading spinner")
    }

    @Test
    fun `should extract block comment text`() {
        // Arrange
        val code = """
            /* accessible icon button */
            const IconButton = () => <button aria-label="close" />;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.TSX)

        // Assert
        assertThat(result.comments).containsExactlyInAnyOrder("accessible icon button")
    }

    @Test
    fun `should extract string literal from props`() {
        // Arrange
        val code = """
            const App = () => <div className="container">Hello</div>;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.TSX)

        // Assert
        assertThat(result.strings).containsExactlyInAnyOrder("container")
    }

    @Test
    fun `should extract interface name as identifier`() {
        // Arrange
        val code = """
            interface ButtonProps {
                label: string;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.TSX)

        // Assert
        assertThat(result.identifiers).containsExactlyInAnyOrder("ButtonProps", "label")
    }

    @Test
    fun `should extract component name from jsx opening element`() {
        // Arrange - needs real TSX parser for jsx_opening_element nodes to be produced
        val code = """
            const Button = () => <MyComponent>content</MyComponent>;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.TSX)

        // Assert — expects real TSX parser to produce jsx_opening_element nodes
        assertThat(result.identifiers).containsExactlyInAnyOrder("Button", "MyComponent")
    }

    @Test
    fun `should extract component name from jsx self-closing element`() {
        // Arrange
        val code = """
            const App = () => <Icon />;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.TSX)

        // Assert
        assertThat(result.identifiers).containsExactlyInAnyOrder("App", "Icon")
    }

    @Test
    fun `should extract attribute name from jsx attribute`() {
        // Arrange
        val code = """
            const App = () => <button onClick={fn} />;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.TSX)

        // Assert
        assertThat(result.identifiers).containsExactlyInAnyOrder("App", "button", "onClick")
    }

    @Test
    fun `should extract parameter names from typed props`() {
        // Arrange
        val code = """
            const Button = ({ label, onClick }: ButtonProps) => <button />;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.TSX)

        // Assert
        assertThat(result.identifiers).containsExactlyInAnyOrder("Button", "label", "onClick", "button")
    }

    @Test
    fun `should not extract JSX text content as string`() {
        // Arrange - "Hello World" is JSX text, not a string literal
        val code = """
            const Hello = () => <p>Hello World</p>;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.TSX)

        // Assert
        assertThat(result.strings).doesNotContain("Hello World")
    }
}
