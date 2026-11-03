package de.maibornwolff.codecharta.analysers.parsers.rawtext.tokei

import de.maibornwolff.codecharta.analysers.parsers.rawtext.language.Delimiters
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class TokeiLanguageTableTest {
    @Test
    fun `should find the comment syntax of a language by its file extension`() {
        // Arrange
        val fileName = "Main.kt"

        // Act
        val syntax = TokeiLanguageTable.syntaxFor(fileName)

        // Assert
        assertThat(syntax?.lineComments).containsExactly("//")
        assertThat(syntax?.nestedBlockComments).containsExactly(Delimiters("/*", "*/"))
        assertThat(syntax?.blockComments).isEmpty()
    }

    @Test
    fun `should find a language when the file extension is upper case`() {
        // Arrange
        val fileName = "MAIN.GO"

        // Act
        val syntax = TokeiLanguageTable.syntaxFor(fileName)

        // Assert
        assertThat(syntax?.lineComments).containsExactly("//")
        assertThat(syntax?.blockComments).containsExactly(Delimiters("/*", "*/"))
    }

    @Test
    fun `should find a language by its file name when the file has no extension`() {
        // Arrange
        val fileName = "Makefile"

        // Act
        val syntax = TokeiLanguageTable.syntaxFor(fileName)

        // Assert
        assertThat(syntax?.lineComments).containsExactly("#")
    }

    @Test
    fun `should find a language whose extension contains a dot`() {
        // Arrange
        val fileName = "Object.cs.st"

        // Act
        val syntax = TokeiLanguageTable.syntaxFor(fileName)

        // Assert
        assertThat(syntax?.quotes).containsExactly(Delimiters("'", "'"))
    }

    @Test
    fun `should unescape the quotes of tokei's table`() {
        // Arrange
        val fileName = "main.rs"

        // Act
        val syntax = TokeiLanguageTable.syntaxFor(fileName)

        // Assert
        assertThat(syntax?.quotes).containsExactly(Delimiters("\"", "\""), Delimiters("#\"", "\"#"))
        assertThat(syntax?.verbatimQuotes).containsExactly(Delimiters("r##\"", "\"##"), Delimiters("r#\"", "\"#"))
    }

    @Test
    fun `should read doc quotes and language specific nested comments`() {
        // Arrange
        val pythonFile = "script.py"
        val dFile = "app.d"

        // Act
        val pythonSyntax = TokeiLanguageTable.syntaxFor(pythonFile)
        val dSyntax = TokeiLanguageTable.syntaxFor(dFile)

        // Assert
        assertThat(pythonSyntax?.docQuotes).startsWith(Delimiters("\"\"\"", "\"\"\""), Delimiters("'''", "'''"))
        assertThat(dSyntax?.blockComments).containsExactly(Delimiters("/*", "*/"))
        assertThat(dSyntax?.nestedBlockComments).containsExactly(Delimiters("/+", "+/"))
    }

    @Test
    fun `should not know a file whose extension tokei does not list`() {
        // Arrange
        val fileName = "notes.xyz"

        // Act
        val syntax = TokeiLanguageTable.syntaxFor(fileName)

        // Assert
        assertThat(syntax).isNull()
    }

    @Test
    fun `should not know a literate language because tokei counts all its text as comment`() {
        // Arrange
        val fileName = "README.md"

        // Act
        val syntax = TokeiLanguageTable.syntaxFor(fileName)

        // Assert
        assertThat(syntax).isNull()
    }
}
