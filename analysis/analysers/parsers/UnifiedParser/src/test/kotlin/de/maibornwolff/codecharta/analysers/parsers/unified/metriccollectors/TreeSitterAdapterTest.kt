package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.serialization.FileExtension
import de.maibornwolff.treesitter.excavationsite.api.AvailableFileMetrics
import de.maibornwolff.treesitter.excavationsite.api.Language
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File
import java.nio.file.Path

class TreeSitterAdapterTest {
    @TempDir
    lateinit var tempDir: Path

    @Test
    fun `should collect metrics for file by reading content automatically`() {
        // Arrange
        val javaFile = tempDir.resolve("Test.java").toFile()
        javaFile.writeText("public class Test { }")

        // Act
        val result = TreeSitterAdapter.collectMetricsForFile(javaFile)

        // Assert
        assertThat(result.name).isEqualTo("Test.java")
        assertThat(result.type).isEqualTo(NodeType.File)
        assertThat(result.checksum).isNotNull()
    }

    @Test
    fun `should collect metrics for file with provided content`() {
        // Arrange
        val javaFile = tempDir.resolve("Test.java").toFile()
        javaFile.createNewFile()
        val content = "public void foo() { if(true) {} }"

        // Act
        val result = TreeSitterAdapter.collectMetricsForFile(javaFile, content)

        // Assert
        assertThat(result.name).isEqualTo("Test.java")
        assertThat(result.attributes).isNotEmpty()
    }

    @Test
    fun `should throw exception for unsupported file extension`() {
        // Arrange
        val unsupportedFile = tempDir.resolve("test.xyz").toFile()
        unsupportedFile.writeText("some content")

        // Act & Assert
        assertThatThrownBy { TreeSitterAdapter.collectMetricsForFile(unsupportedFile) }
            .isInstanceOf(IllegalArgumentException::class.java)
            .hasMessageContaining("Unsupported file extension")
    }

    @Test
    fun `should map all supported FileExtensions to Languages`() {
        // Arrange
        val expectedMappings = mapOf(
            FileExtension.JAVA to Language.JAVA,
            FileExtension.KOTLIN to Language.KOTLIN,
            FileExtension.TYPESCRIPT to Language.TYPESCRIPT,
            FileExtension.JAVASCRIPT to Language.JAVASCRIPT,
            FileExtension.PYTHON to Language.PYTHON,
            FileExtension.GO to Language.GO,
            FileExtension.PHP to Language.PHP,
            FileExtension.RUBY to Language.RUBY,
            FileExtension.SWIFT to Language.SWIFT,
            FileExtension.BASH to Language.BASH,
            FileExtension.CSHARP to Language.CSHARP,
            FileExtension.CPP to Language.CPP,
            FileExtension.C to Language.C,
            FileExtension.OBJECTIVE_C to Language.OBJECTIVE_C,
            FileExtension.VUE to Language.VUE
        )

        // Act & Assert
        expectedMappings.forEach { (fileExtension, expectedLanguage) ->
            val result = TreeSitterAdapter.getLanguageForExtension(fileExtension)
            assertThat(result)
                .describedAs("FileExtension.$fileExtension should map to Language.$expectedLanguage")
                .isEqualTo(expectedLanguage)
        }
    }

    @Test
    fun `should return null for unsupported FileExtension`() {
        // Arrange
        val unsupportedExtension = FileExtension.JSON

        // Act
        val result = TreeSitterAdapter.getLanguageForExtension(unsupportedExtension)

        // Assert
        assertThat(result).isNull()
    }

    @Test
    fun `should detect language from file extension`() {
        // Arrange
        val javaFile = File("Test.java")
        val kotlinFile = File("Test.kt")
        val pythonFile = File("test.py")

        // Act & Assert
        assertThat(TreeSitterAdapter.getLanguageForFile(javaFile)).isEqualTo(Language.JAVA)
        assertThat(TreeSitterAdapter.getLanguageForFile(kotlinFile)).isEqualTo(Language.KOTLIN)
        assertThat(TreeSitterAdapter.getLanguageForFile(pythonFile)).isEqualTo(Language.PYTHON)
    }

    @Test
    fun `should return null for unknown file extension`() {
        // Arrange
        val unknownFile = File("test.unknown")

        // Act
        val result = TreeSitterAdapter.getLanguageForFile(unknownFile)

        // Assert
        assertThat(result).isNull()
    }

    @Test
    fun `should handle uppercase file extensions`() {
        // Arrange
        val javaFile = File("Test.JAVA")

        // Act
        val result = TreeSitterAdapter.getLanguageForFile(javaFile)

        // Assert
        assertThat(result).isEqualTo(Language.JAVA)
    }

    @Test
    fun `should return true for supported FileExtensions`() {
        // Arrange
        val supportedExtensions = listOf(
            FileExtension.JAVA,
            FileExtension.KOTLIN,
            FileExtension.TYPESCRIPT,
            FileExtension.JAVASCRIPT,
            FileExtension.PYTHON,
            FileExtension.GO,
            FileExtension.PHP,
            FileExtension.RUBY,
            FileExtension.SWIFT,
            FileExtension.BASH,
            FileExtension.CSHARP,
            FileExtension.CPP,
            FileExtension.C,
            FileExtension.OBJECTIVE_C,
            FileExtension.VUE
        )

        // Act & Assert
        supportedExtensions.forEach { extension ->
            assertThat(TreeSitterAdapter.isSupported(extension))
                .describedAs("FileExtension.$extension should be supported")
                .isTrue()
        }
    }

    @Test
    fun `should return false for unsupported FileExtensions`() {
        // Arrange
        val unsupportedExtension = FileExtension.JSON

        // Act
        val result = TreeSitterAdapter.isSupported(unsupportedExtension)

        // Assert
        assertThat(result).isFalse()
    }

    @Test
    fun `should collect metrics with explicit language parameter`() {
        // Arrange
        val fileName = "test.java"
        val content = "public void method() { }"

        // Act
        val result = TreeSitterAdapter.collectMetrics(fileName, content, Language.JAVA)

        // Assert
        assertThat(result.name).isEqualTo(fileName)
        assertThat(result.type).isEqualTo(NodeType.File)
        assertThat(result.checksum).isNotNull()
        assertThat(result.attributes).isNotEmpty()
    }

    @Test
    fun `should calculate checksum from file content`() {
        // Arrange
        val fileName = "test.java"
        val content = "public class Test {}"

        // Act
        val result1 = TreeSitterAdapter.collectMetrics(fileName, content, Language.JAVA)
        val result2 = TreeSitterAdapter.collectMetrics(fileName, content, Language.JAVA)
        val resultDifferentContent = TreeSitterAdapter.collectMetrics(fileName, "different", Language.JAVA)

        // Assert
        assertThat(result1.checksum).isEqualTo(result2.checksum)
        assertThat(result1.checksum).isNotEqualTo(resultDifferentContent.checksum)
    }

    @Test
    fun `should include file-level and per-function metrics in result`() {
        // Arrange
        val content = """
            public void methodOne() {
                if (true) { }
            }
            public void methodTwo() {
                for (int i = 0; i < 10; i++) { }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterAdapter.collectMetrics("test.java", content, Language.JAVA)

        // Assert
        assertThat(result.attributes).containsKey(AvailableFileMetrics.COMPLEXITY.metricName)
        assertThat(result.attributes).containsKey(AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName)
    }
}
