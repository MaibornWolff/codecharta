package languages

import de.maibornwolff.codecharta.importer.coverage.languages.ImporterStrategy
import de.maibornwolff.codecharta.model.ProjectBuilder
import de.maibornwolff.codecharta.serialization.FileExtension
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import java.io.File
import java.io.FileNotFoundException

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ImporterStrategyTest {
    private val testStrategy = object : ImporterStrategy {
        override val fileExtensions: List<FileExtension> = listOf(FileExtension.JS_TS_COVERAGE)
        override val defaultReportFileName: String = "lcov.info"

        override fun buildCCJson(coverageFile: File, projectBuilder: ProjectBuilder) {
            // Implementation not needed for this test
        }
    }

    @Test
    fun `should find the default report file`() {
        val directory = File("src/test/resources/languages/javascript/nested")
        val expectedFile = File("src/test/resources/languages/javascript/nested/lcov.info")

        val result = testStrategy.getReportFileFromString(directory.path)

        assertThat(result).isEqualTo(expectedFile)
    }

    @Test
    fun `should return file if input is a file matching the default file`() {
        val file = File("src/test/resources/languages/javascript/lcov.info")

        val result = testStrategy.getReportFileFromString(file.path)

        assertThat(result).isEqualTo(file)
    }

    @Test
    fun `should return file if input is a file with correct extension`() {
        val file = File("src/test/resources/languages/javascript/minimal_lcov.info")

        val result = testStrategy.getReportFileFromString(file.path)

        assertThat(result).isEqualTo(file)
    }

    @Test
    fun `should throw no file found if there is no matching file`() {
        val directory = File("src/test/kotlin")

        assertThatThrownBy { testStrategy.getReportFileFromString(directory.path) }
            .isInstanceOf(FileNotFoundException::class.java)
            .hasMessageContaining("No matching files found in directory")
    }

    @Test
    fun `should throw file not found if file does not exist`() {
        val file = File("src/test/resources/languages/javascript/non_existent_file.info")

        assertThatThrownBy { testStrategy.getReportFileFromString(file.path) }
            .isInstanceOf(FileNotFoundException::class.java)
            .hasMessageContaining("File not found")
    }

    @Test
    fun `should throw no matching file extension if file does not match any known file extension`() {
        val file = File("src/test/resources/languages/javascript/invalid_existing_file.txt")

        assertThatThrownBy { testStrategy.getReportFileFromString(file.path) }
            .isInstanceOf(FileNotFoundException::class.java)
            .hasMessageContaining("does not match any known file extension")
    }

    @Test
    fun `should throw multiple files found if multiple files match the default file`() {
        val directory = File("src/test/resources/languages/javascript")

        assertThatThrownBy { testStrategy.getReportFileFromString(directory.path) }
            .isInstanceOf(FileNotFoundException::class.java)
            .hasMessageContaining("Multiple matching files found in directory")
    }
}
