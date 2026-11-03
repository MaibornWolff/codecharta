package de.maibornwolff.codecharta.analysers.parsers.rawtext.language

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class LineClassifierTest {
    private val cStyleSyntax = LanguageSyntax(
        lineComments = listOf("//"),
        blockComments = listOf(Delimiters("/*", "*/")),
        quotes = listOf(Delimiters("\"", "\""))
    )

    private val code = LineKind(hasCode = true, hasComment = false)
    private val comment = LineKind(hasCode = false, hasComment = true)
    private val codeAndComment = LineKind(hasCode = true, hasComment = true)
    private val blank = LineKind(hasCode = false, hasComment = false)

    private fun classifyAll(syntax: LanguageSyntax, vararg lines: String): List<LineKind> {
        val classifier = LineClassifier(syntax)
        return lines.map { classifier.classify(it) }
    }

    @Test
    fun `should classify code, line comment and blank lines`() {
        // Arrange
        val lines = arrayOf("val x = 1", "  // note", "   ", "")

        // Act
        val kinds = classifyAll(cStyleSyntax, *lines)

        // Assert
        assertThat(kinds).containsExactly(code, comment, blank, blank)
    }

    @Test
    fun `should count a line with code and a trailing comment as both`() {
        // Arrange
        val lines = arrayOf("val x = 1 // note", "val y = 2 /* note */")

        // Act
        val kinds = classifyAll(cStyleSyntax, *lines)

        // Assert
        assertThat(kinds).containsExactly(codeAndComment, codeAndComment)
    }

    @Test
    fun `should count every row of a block comment including blank rows`() {
        // Arrange
        val lines = arrayOf("/* start", "", "   end */", "val x = 1")

        // Act
        val kinds = classifyAll(cStyleSyntax, *lines)

        // Assert
        assertThat(kinds).containsExactly(comment, comment, comment, code)
    }

    @Test
    fun `should count code after a block comment closes on the same line`() {
        // Arrange
        val lines = arrayOf("/* a", "b */ call()")

        // Act
        val kinds = classifyAll(cStyleSyntax, *lines)

        // Assert
        assertThat(kinds).containsExactly(comment, codeAndComment)
    }

    @Test
    fun `should not start a comment inside a string`() {
        // Arrange
        val lines = arrayOf("val url = \"http://host/*\"", "val y = 2")

        // Act
        val kinds = classifyAll(cStyleSyntax, *lines)

        // Assert
        assertThat(kinds).containsExactly(code, code)
    }

    @Test
    fun `should keep a string open past an escaped quote`() {
        // Arrange
        val lines = arrayOf("val s = \"say \\\" // not a comment\"")

        // Act
        val kinds = classifyAll(cStyleSyntax, *lines)

        // Assert
        assertThat(kinds).containsExactly(code)
    }

    @Test
    fun `should not treat a backslash as escape in a verbatim string`() {
        // Arrange
        val syntax = cStyleSyntax.copy(verbatimQuotes = listOf(Delimiters("@\"", "\"")))
        val lines = arrayOf("var path = @\"C:\\\" // note")

        // Act
        val kinds = classifyAll(syntax, *lines)

        // Assert
        assertThat(kinds).containsExactly(codeAndComment)
    }

    @Test
    fun `should count every row of a multi-line string as code including blank rows`() {
        // Arrange
        val lines = arrayOf("val s = \"first", "", "// inside\"", "// outside")

        // Act
        val kinds = classifyAll(cStyleSyntax, *lines)

        // Assert
        assertThat(kinds).containsExactly(code, code, code, comment)
    }

    @Test
    fun `should close a nested block comment only at its outermost end`() {
        // Arrange
        val syntax = LanguageSyntax(nestedBlockComments = listOf(Delimiters("/*", "*/")))
        val lines = arrayOf("/* outer /* inner */", "still comment */ code")

        // Act
        val kinds = classifyAll(syntax, *lines)

        // Assert
        assertThat(kinds).containsExactly(comment, codeAndComment)
    }

    @Test
    fun `should close a non-nested block comment at the first end`() {
        // Arrange
        val lines = arrayOf("/* outer /* inner */ code")

        // Act
        val kinds = classifyAll(cStyleSyntax, *lines)

        // Assert
        assertThat(kinds).containsExactly(codeAndComment)
    }

    @Test
    fun `should count a doc quote that opens a line as comment`() {
        // Arrange
        val syntax = LanguageSyntax(
            lineComments = listOf("#"),
            quotes = listOf(Delimiters("\"", "\"")),
            docQuotes = listOf(Delimiters("\"\"\"", "\"\"\""))
        )
        val lines = arrayOf("    \"\"\"Docstring", "", "    \"\"\"", "x = 1")

        // Act
        val kinds = classifyAll(syntax, *lines)

        // Assert
        assertThat(kinds).containsExactly(comment, comment, comment, code)
    }

    @Test
    fun `should count a doc quote after code on the same line as a string`() {
        // Arrange
        val syntax = LanguageSyntax(
            lineComments = listOf("#"),
            quotes = listOf(Delimiters("\"", "\"")),
            docQuotes = listOf(Delimiters("\"\"\"", "\"\"\""))
        )
        val lines = arrayOf("text = \"\"\"first", "# inside\"\"\"")

        // Act
        val kinds = classifyAll(syntax, *lines)

        // Assert
        assertThat(kinds).containsExactly(code, code)
    }

    @Test
    fun `should close a triple quoted string at the last three quotes of a longer run`() {
        // Arrange
        val syntax = cStyleSyntax.copy(quotes = listOf(Delimiters("\"\"\"", "\"\"\""), Delimiters("\"", "\"")))
        val lines = arrayOf("val s = \"\"\"say \"hi\"\"\"\"", "// note")

        // Act
        val kinds = classifyAll(syntax, *lines)

        // Assert
        assertThat(kinds).containsExactly(code, comment)
    }

    @Test
    fun `should treat a char literal holding a quote as plain code`() {
        // Arrange
        val lines = arrayOf("val isQuote = character == '\"' || character == '\\''", "// note")

        // Act
        val kinds = classifyAll(cStyleSyntax, *lines)

        // Assert
        assertThat(kinds).containsExactly(code, comment)
    }

    @Test
    fun `should keep single quotes as markers when the language uses them`() {
        // Arrange
        val syntax = LanguageSyntax(lineComments = listOf("'"), quotes = listOf(Delimiters("\"", "\"")))
        val lines = arrayOf("'\"' is a comment here")

        // Act
        val kinds = classifyAll(syntax, *lines)

        // Assert
        assertThat(kinds).containsExactly(comment)
    }

    @Test
    fun `should prefer the longest marker that starts at a position`() {
        // Arrange
        val syntax = LanguageSyntax(
            lineComments = listOf("-"),
            blockComments = listOf(Delimiters("-{", "}-"))
        )
        val lines = arrayOf("-{ block", "}- code")

        // Act
        val kinds = classifyAll(syntax, *lines)

        // Assert
        assertThat(kinds).containsExactly(comment, codeAndComment)
    }
}
