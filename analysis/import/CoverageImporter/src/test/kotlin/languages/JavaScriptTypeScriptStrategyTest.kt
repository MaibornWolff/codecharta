package languages

import de.maibornwolff.codecharta.importer.tokeiimporter.strategy.JavaScriptTypeScriptStrategy
import de.maibornwolff.codecharta.model.ProjectBuilder
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import io.mockk.unmockkAll
import org.assertj.core.api.AssertionsForClassTypes.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import java.io.ByteArrayOutputStream
import java.io.File

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class JavaScriptTypeScriptStrategyTest {

    @AfterEach
    fun afterTest() {
        unmockkAll()
    }

    @Test
    fun `should contain minimal expected content`() {
        val expectedFilePath = "src/test/resources/languages/JavaScriptTypeScript/minimal_expected_output.cc.json"
        val expectedProject = ProjectDeserializer.deserializeProject(File(expectedFilePath).inputStream())
        val coverageReport = File("src/test/resources/languages/JavaScriptTypeScript/minimal_lcov.info")
        val projectBuilder = ProjectBuilder()

        JavaScriptTypeScriptStrategy().buildCCJson(coverageReport, projectBuilder)

        val project = projectBuilder.build()
        assertThat(project.toString()).isEqualTo(expectedProject.toString())
    }
}
