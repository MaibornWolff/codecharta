package de.maibornwolff.codecharta.tools.validation

import de.maibornwolff.codecharta.util.InputHelper
import io.mockk.every
import io.mockk.mockkObject
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions
import org.everit.json.schema.ValidationException
import org.json.JSONException
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import picocli.CommandLine
import java.io.ByteArrayOutputStream
import java.io.PrintStream
import kotlin.test.assertFailsWith

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class EveritValidatorTest {
val errContent = ByteArrayOutputStream()
    val originalErr = System.err

    @AfterEach
    fun afterTest() {
        unmockkAll()
    }

    private val validator = EveritValidator(ValidationTool.SCHEMA_PATH)

    @Test
    fun `should extract and validate a valid file`() {
        validator.validate(this.javaClass.classLoader.getResourceAsStream("validCompressed.gz"))
    }

    @Test
    fun `should throw exception if extracted file is invalid json`() {
        assertFailsWith(JSONException::class) {
            validator.validate(this.javaClass.classLoader.getResourceAsStream("invalidJSONCompressed.gz"))
        }
    }

    @Test
    fun `should throw exception on compressed json with no project`() {
        assertFailsWith(ValidationException::class) {
            validator.validate(this.javaClass.classLoader.getResourceAsStream("invalidProjectCompressed.gz"))
        }
    }

    @Test
    fun `should validate valid File`() {
        validator.validate(this.javaClass.classLoader.getResourceAsStream("validFile.json"))
    }

    @Test
    fun `should throw exception on missing node name`() {
        assertFailsWith(ValidationException::class) {
            validator.validate(this.javaClass.classLoader.getResourceAsStream("missingNodeNameFile.json"))
        }
    }

    @Test
    fun `should throw exception on missing project`() {
        assertFailsWith(ValidationException::class) {
            validator.validate(this.javaClass.classLoader.getResourceAsStream("invalidFile.json"))
        }
    }

    @Test
    fun `should throw exception if no json file`() {
        assertFailsWith(JSONException::class) {
            validator.validate(this.javaClass.classLoader.getResourceAsStream("invalidJson.json"))
        }
    }

    @Test
    fun `should stop execution if input files are invalid`() {
        mockkObject(InputHelper)
        every {
            InputHelper.isInputValid(any(), any())
        } returns false

        System.setErr(PrintStream(errContent))
        CommandLine(ValidationTool()).execute("thisDoesNotExist.cc.json").toString()
        System.setErr(originalErr)

        Assertions.assertThat(errContent.toString())
                .contains("Input invalid file for ValidationTool, stopping execution")
    }
}
