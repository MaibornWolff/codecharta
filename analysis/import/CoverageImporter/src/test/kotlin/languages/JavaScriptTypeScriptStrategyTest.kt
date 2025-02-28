package languages

import de.maibornwolff.codecharta.importer.tokeiimporter.strategy.JavaScriptTypeScriptStrategy
import de.maibornwolff.codecharta.model.ProjectBuilder
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import io.mockk.unmockkAll
import org.assertj.core.api.AssertionsForClassTypes.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.skyscreamer.jsonassert.JSONAssert
import org.skyscreamer.jsonassert.JSONCompareMode
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.OutputStreamWriter
import java.io.PrintStream

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class JavaScriptTypeScriptStrategyTest {
    private var errContent = ByteArrayOutputStream()
    private val originalErr = System.err

    @AfterEach
    fun afterTest() {
        unmockkAll()
        errContent = ByteArrayOutputStream()
    }

    @Test
    fun `should contain minimal expected content`() {
        val expectedFilePath = "src/test/resources/languages/JavaScriptTypeScript/minimal_output.cc.json"
        val expectedProject = ProjectDeserializer.deserializeProject(File(expectedFilePath).inputStream())
        val coverageReport = File("src/test/resources/languages/JavaScriptTypeScript/minimal_lcov.info")
        val projectBuilder = ProjectBuilder()
        val outputStream = ByteArrayOutputStream()

        JavaScriptTypeScriptStrategy().buildCCJson(coverageReport, projectBuilder)
        val project = projectBuilder.build()
        ProjectSerializer.serializeProject(
            project,
            OutputStreamWriter(PrintStream(outputStream))
        )

        assertThat(project).isEqualTo(expectedProject)
        JSONAssert.assertEquals(File(expectedFilePath).readText(), outputStream.toString(), JSONCompareMode.NON_EXTENSIBLE)
    }

}
