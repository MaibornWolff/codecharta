package de.maibornwolff.codecharta.analysers.tools.multicommit

import de.maibornwolff.codecharta.ccsh.Ccsh
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import picocli.CommandLine
import java.io.File
import java.nio.file.Path

class ParserExecutorTest {
    @TempDir
    lateinit var tempDir: Path

    private lateinit var commandLine: CommandLine
    private lateinit var parserExecutor: ParserExecutor

    @BeforeEach
    fun setup() {
        commandLine = CommandLine(Ccsh())
        parserExecutor = ParserExecutor(commandLine)
    }

    @Test
    fun `should parse simple parser string`() {
        // Arrange
        val parserString = "unified --file-extensions=java,kt"

        // Act
        val result = parserExecutor.splitParserArgs(parserString)

        // Assert
        assertEquals(2, result.size)
        assertEquals("unified", result[0])
        assertEquals("--file-extensions=java,kt", result[1])
    }

    @Test
    fun `should parse parser string with single quotes`() {
        // Arrange
        val parserString = "unified --exclude='**/test/**'"

        // Act
        val result = parserExecutor.splitParserArgs(parserString)

        // Assert
        assertEquals(2, result.size)
        assertEquals("unified", result[0])
        assertEquals("--exclude=**/test/**", result[1])
    }

    @Test
    fun `should parse parser string with double quotes`() {
        // Arrange
        val parserString = "unified --exclude=\"**/test/**\""

        // Act
        val result = parserExecutor.splitParserArgs(parserString)

        // Assert
        assertEquals(2, result.size)
        assertEquals("unified", result[0])
        assertEquals("--exclude=**/test/**", result[1])
    }

    @Test
    fun `should parse parser string with multiple quoted arguments`() {
        // Arrange
        val parserString = "unified --exclude='**/test/**' --file-extensions=\"java,kt\""

        // Act
        val result = parserExecutor.splitParserArgs(parserString)

        // Assert
        assertEquals(3, result.size)
        assertEquals("unified", result[0])
        assertEquals("--exclude=**/test/**", result[1])
        assertEquals("--file-extensions=java,kt", result[2])
    }

    @Test
    fun `should parse parser string with spaces in quoted values`() {
        // Arrange
        val parserString = "unified --exclude='test files/**'"

        // Act
        val result = parserExecutor.splitParserArgs(parserString)

        // Assert
        assertEquals(2, result.size)
        assertEquals("unified", result[0])
        assertEquals("--exclude=test files/**", result[1])
    }

    @Test
    fun `should throw exception when parser string is empty`() {
        // Arrange
        val parserString = ""

        // Act & Assert
        val exception = assertThrows(ParserExecutionException::class.java) {
            parserExecutor.splitParserArgs(parserString)
        }
        assertTrue(exception.message!!.contains("cannot be empty"))
    }

    @Test
    fun `should throw exception when parser name does not exist`() {
        // Arrange
        val parserString = "nonexistentparser --arg=value"
        val commitSha = "abc1234"

        // Act & Assert
        val exception = assertThrows(ParserExecutionException::class.java) {
            parserExecutor.executeParser(parserString, commitSha, null)
        }
        assertTrue(exception.message!!.contains("not found"))
    }

    @Test
    fun `should validate that unified parser exists`() {
        // Arrange
        val parserString = "unified"
        val commitSha = "abc1234"
        val outputFile = File(tempDir.toFile(), "output.cc.json")

        // Act & Assert (should not throw exception for parser validation)
        // Note: This will fail at execution stage since we don't have actual source files,
        // but validation should pass
        try {
            parserExecutor.executeParser(parserString, commitSha, outputFile.absolutePath)
        } catch (e: Exception) {
            // Expected to fail at execution, but not at validation
            // Check that error is not about parser not found
            if (e is ParserExecutionException && e.message!!.contains("not found")) {
                throw AssertionError("Parser validation should not fail for 'unified' parser")
            }
        }
    }

    @Test
    fun `should remove output flag with separate value`() {
        // Arrange
        val args = mutableListOf("--file-extensions=java", "--output", "wrong.cc.json", "--compress")

        // Act
        parserExecutor.removeOutputFlagIfPresent(args)

        // Assert
        assertEquals(2, args.size)
        assertEquals("--file-extensions=java", args[0])
        assertEquals("--compress", args[1])
    }

    @Test
    fun `should remove short output flag with separate value`() {
        // Arrange
        val args = mutableListOf("--file-extensions=java", "-o", "wrong.cc.json", "--compress")

        // Act
        parserExecutor.removeOutputFlagIfPresent(args)

        // Assert
        assertEquals(2, args.size)
        assertEquals("--file-extensions=java", args[0])
        assertEquals("--compress", args[1])
    }

    @Test
    fun `should remove output flag with equals sign`() {
        // Arrange
        val args = mutableListOf("--file-extensions=java", "--output=wrong.cc.json", "--compress")

        // Act
        parserExecutor.removeOutputFlagIfPresent(args)

        // Assert
        assertEquals(2, args.size)
        assertEquals("--file-extensions=java", args[0])
        assertEquals("--compress", args[1])
    }

    @Test
    fun `should handle multiple output flags`() {
        // Arrange
        val args = mutableListOf("--output", "file1.json", "-o", "file2.json", "--compress")

        // Act
        parserExecutor.removeOutputFlagIfPresent(args)

        // Assert
        assertEquals(1, args.size)
        assertEquals("--compress", args[0])
    }

    @Test
    fun `should inject output parameter with commit SHA prefix`() {
        // Arrange
        val args = mutableListOf("--file-extensions=java")
        val commitSha = "abc1234"
        val baseFilename = "output.cc.json"

        // Act
        parserExecutor.injectOutputParameter(args, commitSha, baseFilename)

        // Assert
        assertEquals(3, args.size)
        assertEquals("--file-extensions=java", args[0])
        assertEquals("--output", args[1])
        assertEquals("abc1234_output.cc.json", args[2])
    }

    @Test
    fun `should append cc-json extension if missing`() {
        // Arrange
        val args = mutableListOf("--file-extensions=java")
        val commitSha = "abc1234"
        val baseFilename = "output"

        // Act
        parserExecutor.injectOutputParameter(args, commitSha, baseFilename)

        // Assert
        assertEquals(3, args.size)
        assertEquals("--output", args[1])
        assertEquals("abc1234_output.cc.json", args[2])
    }

    @Test
    fun `should preserve directory path when injecting output`() {
        // Arrange
        val args = mutableListOf("--file-extensions=java")
        val commitSha = "abc1234"
        val baseFilename = "./results/output.cc.json"

        // Act
        parserExecutor.injectOutputParameter(args, commitSha, baseFilename)

        // Assert
        assertEquals(3, args.size)
        assertEquals("--output", args[1])
        assertTrue(args[2].endsWith("abc1234_output.cc.json"))
        assertTrue(args[2].startsWith("./results"))
    }

    @Test
    fun `should preserve absolute path when injecting output`() {
        // Arrange
        val args = mutableListOf("--file-extensions=java")
        val commitSha = "abc1234"
        val baseFilename = "/tmp/results/output.cc.json"

        // Act
        parserExecutor.injectOutputParameter(args, commitSha, baseFilename)

        // Assert
        assertEquals(3, args.size)
        assertEquals("--output", args[1])
        assertEquals("/tmp/results/abc1234_output.cc.json", args[2])
    }

//    @Test
//    fun `should not inject output parameter when base filename is null`() {
//        // Arrange
//        val args = mutableListOf("--file-extensions=java")
//        val commitSha = "abc1234"
//
//        // Act
//        parserExecutor.injectOutputParameter(args, commitSha, null)
//
//        // Assert
//        assertEquals(1, args.size)
//        assertEquals("--file-extensions=java", args[0])
//    }

    @Test
    fun `should handle parser string with only parser name`() {
        // Arrange
        val parserString = "unified"

        // Act
        val result = parserExecutor.splitParserArgs(parserString)

        // Assert
        assertEquals(1, result.size)
        assertEquals("unified", result[0])
    }

    @Test
    fun `should handle escaped quotes in parser string`() {
        // Arrange
        val parserString = "unified --exclude='test\\'s files/**'"

        // Act
        val result = parserExecutor.splitParserArgs(parserString)

        // Assert
        assertEquals(2, result.size)
        assertEquals("unified", result[0])
        assertEquals("--exclude=test's files/**", result[1])
    }

    @Test
    fun `should preserve only filename prefix with commit SHA`() {
        // Arrange
        val args = mutableListOf<String>()
        val commitSha = "def5678"
        val baseFilename = "myproject"

        // Act
        parserExecutor.injectOutputParameter(args, commitSha, baseFilename)

        // Assert
        assertEquals(2, args.size)
        assertEquals("--output", args[0])
        assertEquals("def5678_myproject.cc.json", args[1])
    }
}
