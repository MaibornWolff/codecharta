package de.maibornwolff.codecharta.analysers.tools.validation

import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
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
import java.io.ByteArrayInputStream
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
        validator.validate(this.javaClass.classLoader.getResourceAsStream("validCompressed.gz")!!)
    }

    @Test
    fun `should throw exception if extracted file is invalid json`() {
        assertFailsWith(JSONException::class) {
            validator.validate(this.javaClass.classLoader.getResourceAsStream("invalidJSONCompressed.gz")!!)
        }
    }

    @Test
    fun `should throw exception on compressed json with no project`() {
        assertFailsWith(ValidationException::class) {
            validator.validate(this.javaClass.classLoader.getResourceAsStream("invalidProjectCompressed.gz")!!)
        }
    }

    @Test
    fun `should validate valid File`() {
        validator.validate(this.javaClass.classLoader.getResourceAsStream("validFile.cc.json")!!)
    }

    @Test
    fun `should validate a 2_0 lens-format file`() {
        val validFile = this.javaClass.classLoader
            .getResourceAsStream("validFile.cc.json")!!
            .bufferedReader()
            .readText()
        val project = ProjectDeserializer.deserializeProject(validFile)
        val v2 = ProjectSerializer.serializeToString(project)

        validator.validate(ByteArrayInputStream(v2.toByteArray()))
    }

    @Test
    fun `should reject a 2_0 file node that has children`() {
        val fileWithChildren =
            """{"meta":{"projectName":"p","apiVersion":"2.0","checksum":"x"},""" +
                """"files":[{"id":"r","name":"root","type":"Folder","children":[""" +
                """{"id":"f","name":"a.kt","type":"File","children":[{"id":"c","name":"impossible.kt","type":"File"}]}]}],"lenses":{}}"""

        assertFailsWith(ValidationException::class) {
            validator.validate(ByteArrayInputStream(fileWithChildren.toByteArray()))
        }
    }

    @Test
    fun `should throw exception on a 2_0 file missing its files array`() {
        val invalid2 = """{"meta":{"projectName":"p","apiVersion":"2.0","checksum":"x"},"lenses":{}}"""

        assertFailsWith(ValidationException::class) {
            validator.validate(ByteArrayInputStream(invalid2.toByteArray()))
        }
    }

    @Test
    fun `should reject a 2_0-shaped file mislabeled with a 1_5 apiVersion`() {
        val mislabeled =
            """{"meta":{"projectName":"p","apiVersion":"1.5","checksum":"x"},""" +
                """"files":[{"id":"r","name":"root","type":"Folder"}],"lenses":{}}"""

        assertFailsWith(ValidationException::class) {
            validator.validate(ByteArrayInputStream(mislabeled.toByteArray()))
        }
    }

    @Test
    fun `should reject a 2_0 file with an unknown property`() {
        val strayKey =
            """{"meta":{"projectName":"p","apiVersion":"2.0","checksum":"x"},""" +
                """"files":[{"id":"r","name":"root","type":"Folder","childrenn":[]}],"lenses":{}}"""

        assertFailsWith(ValidationException::class) {
            validator.validate(ByteArrayInputStream(strayKey.toByteArray()))
        }
    }

    @Test
    fun `should reject a 2_0 file with an empty files array`() {
        val emptyFiles = """{"meta":{"projectName":"p","apiVersion":"2.0","checksum":"x"},"files":[],"lenses":{}}"""

        assertFailsWith(ValidationException::class) {
            validator.validate(ByteArrayInputStream(emptyFiles.toByteArray()))
        }
    }

    @Test
    fun `should reject a 2_0 file with more than one root`() {
        val twoRoots =
            """{"meta":{"projectName":"p","apiVersion":"2.0","checksum":"x"},""" +
                """"files":[{"id":"r1","name":"root","type":"Folder"},{"id":"r2","name":"root2","type":"Folder"}],"lenses":{}}"""

        assertFailsWith(ValidationException::class) {
            validator.validate(ByteArrayInputStream(twoRoots.toByteArray()))
        }
    }

    @Test
    fun `should throw exception on missing node name`() {
        assertFailsWith(ValidationException::class) {
            validator.validate(this.javaClass.classLoader.getResourceAsStream("missingNodeNameFile.json")!!)
        }
    }

    @Test
    fun `should throw exception on missing project`() {
        assertFailsWith(ValidationException::class) {
            validator.validate(this.javaClass.classLoader.getResourceAsStream("invalidFile.json")!!)
        }
    }

    @Test
    fun `should throw exception if no json file`() {
        assertFailsWith(JSONException::class) {
            validator.validate(this.javaClass.classLoader.getResourceAsStream("invalidJson.json")!!)
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

        Assertions
            .assertThat(errContent.toString())
            .contains("Input invalid file for ValidationTool, stopping execution")
    }
}
