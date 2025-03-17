package languages

import de.maibornwolff.codecharta.importer.coverage.languages.JavaScriptStrategy
import de.maibornwolff.codecharta.model.ProjectBuilder
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import io.mockk.unmockkAll
import org.assertj.core.api.AssertionsForClassTypes.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import java.io.File

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class JavaScriptStrategyTest {
    @AfterEach
    fun afterTest() {
        unmockkAll()
    }

    @Test
    fun `should contain minimal expected content`() {
        val expectedFilePath = "src/test/resources/languages/javascript/minimal_expected_output.cc.json"
        val expectedProject = ProjectDeserializer.deserializeProject(File(expectedFilePath).inputStream())
        val coverageReport = File("src/test/resources/languages/javascript/minimal_lcov.info")
        val projectBuilder = ProjectBuilder()

        JavaScriptStrategy().buildCCJson(coverageReport, projectBuilder)

        val project = projectBuilder.build()
        assertThat(project).usingRecursiveComparison().isEqualTo(expectedProject)
    }

    @Test
    fun `should create correct cc json out of coverage report`()  {
        val expectedFilePath = "src/test/resources/languages/javascript/coverage.cc.json"
        val expectedProject = ProjectDeserializer.deserializeProject(File(expectedFilePath).inputStream())
        val coverageReport = File("src/test/resources/languages/javascript/lcov.info")
        val projectBuilder = ProjectBuilder()

        JavaScriptStrategy().buildCCJson(coverageReport, projectBuilder)

        val project = projectBuilder.build()
        assertThat(
            project
        ).usingRecursiveComparison().ignoringFields("attributeDescriptors", "attributeTypes", "blacklist").isEqualTo(expectedProject)
    }
}
