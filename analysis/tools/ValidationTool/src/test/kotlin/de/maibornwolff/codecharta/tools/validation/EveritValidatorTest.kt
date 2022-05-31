package de.maibornwolff.codecharta.tools.validation

import org.everit.json.schema.ValidationException
import org.json.JSONException
import org.junit.jupiter.api.Test
import kotlin.test.assertFailsWith

class EveritValidatorTest {

    private val validator = EveritValidator(ValidationTool.SCHEMA_PATH)

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
}
