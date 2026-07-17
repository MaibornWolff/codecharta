package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.stopwords

import org.junit.jupiter.api.io.TempDir
import java.nio.file.Path
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class DlcIgnoreParserTest {
    private val parser = DlcIgnoreParser()

    @Test
    fun `should return empty set when dlcignore file does not exist`(
        @TempDir tempDir: Path
    ) {
        // Act
        val stopWords = parser.loadCustomStopWords(tempDir)

        // Assert
        assertTrue(stopWords.isEmpty())
    }

    @Test
    fun `should parse single stop word from dlcignore file`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dlcignoreFile = tempDir.resolve(".dlcignore").toFile()
        dlcignoreFile.writeText("custom")

        // Act
        val stopWords = parser.loadCustomStopWords(tempDir)

        // Assert
        assertEquals(setOf("custom"), stopWords)
    }

    @Test
    fun `should parse multiple stop words from dlcignore file`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dlcignoreFile = tempDir.resolve(".dlcignore").toFile()
        dlcignoreFile.writeText(
            """
            domain
            custom
            project
            """.trimIndent()
        )

        // Act
        val stopWords = parser.loadCustomStopWords(tempDir)

        // Assert
        assertEquals(setOf("domain", "custom", "project"), stopWords)
    }

    @Test
    fun `should ignore empty lines in dlcignore file`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dlcignoreFile = tempDir.resolve(".dlcignore").toFile()
        dlcignoreFile.writeText(
            """
            word1

            word2


            word3
            """.trimIndent()
        )

        // Act
        val stopWords = parser.loadCustomStopWords(tempDir)

        // Assert
        assertEquals(setOf("word1", "word2", "word3"), stopWords)
    }

    @Test
    fun `should ignore comment lines starting with hash in dlcignore file`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dlcignoreFile = tempDir.resolve(".dlcignore").toFile()
        dlcignoreFile.writeText(
            """
            # This is a comment
            word1
            # Another comment
            word2
            #comment without space
            word3
            """.trimIndent()
        )

        // Act
        val stopWords = parser.loadCustomStopWords(tempDir)

        // Assert
        assertEquals(setOf("word1", "word2", "word3"), stopWords)
    }

    @Test
    fun `should trim whitespace from stop words in dlcignore file`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dlcignoreFile = tempDir.resolve(".dlcignore").toFile()
        dlcignoreFile.writeText(
            """
              word1
            word2
               word3
            """.trimIndent()
        )

        // Act
        val stopWords = parser.loadCustomStopWords(tempDir)

        // Assert
        assertEquals(setOf("word1", "word2", "word3"), stopWords)
    }

    @Test
    fun `should convert stop words to lowercase in dlcignore file`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dlcignoreFile = tempDir.resolve(".dlcignore").toFile()
        dlcignoreFile.writeText(
            """
            UPPERCASE
            MixedCase
            lowercase
            """.trimIndent()
        )

        // Act
        val stopWords = parser.loadCustomStopWords(tempDir)

        // Assert
        assertEquals(setOf("uppercase", "mixedcase", "lowercase"), stopWords)
    }

    @Test
    fun `should handle dlcignore file with comments empty lines and mixed case`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dlcignoreFile = tempDir.resolve(".dlcignore").toFile()
        dlcignoreFile.writeText(
            """
            # Project-specific stop words
            CustomerID
            OrderID

            # Domain terms to exclude
               ProductSKU
            InvoiceNumber

            # Common abbreviations
            acct
            qty
            """.trimIndent()
        )

        // Act
        val stopWords = parser.loadCustomStopWords(tempDir)

        // Assert
        assertEquals(
            setOf("customerid", "orderid", "productsku", "invoicenumber", "acct", "qty"),
            stopWords
        )
    }

    @Test
    fun `should return empty set when dlcignore is a directory not a file`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dlcignoreDir = tempDir.resolve(".dlcignore").toFile()
        dlcignoreDir.mkdir()

        // Act
        val stopWords = parser.loadCustomStopWords(tempDir)

        // Assert
        assertTrue(stopWords.isEmpty())
    }

    @Test
    fun `should handle empty dlcignore file`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dlcignoreFile = tempDir.resolve(".dlcignore").toFile()
        dlcignoreFile.writeText("")

        // Act
        val stopWords = parser.loadCustomStopWords(tempDir)

        // Assert
        assertTrue(stopWords.isEmpty())
    }

    @Test
    fun `should handle dlcignore file with only comments`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dlcignoreFile = tempDir.resolve(".dlcignore").toFile()
        dlcignoreFile.writeText(
            """
            # Comment 1
            # Comment 2
            # Comment 3
            """.trimIndent()
        )

        // Act
        val stopWords = parser.loadCustomStopWords(tempDir)

        // Assert
        assertTrue(stopWords.isEmpty())
    }

    @Test
    fun `should handle dlcignore file with only empty lines`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dlcignoreFile = tempDir.resolve(".dlcignore").toFile()
        dlcignoreFile.writeText("\n\n\n\n")

        // Act
        val stopWords = parser.loadCustomStopWords(tempDir)

        // Assert
        assertTrue(stopWords.isEmpty())
    }

    @Test
    fun `should deduplicate stop words in dlcignore file`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dlcignoreFile = tempDir.resolve(".dlcignore").toFile()
        dlcignoreFile.writeText(
            """
            word
            word
            WORD
            Word
            """.trimIndent()
        )

        // Act
        val stopWords = parser.loadCustomStopWords(tempDir)

        // Assert
        assertEquals(setOf("word"), stopWords)
    }
}
