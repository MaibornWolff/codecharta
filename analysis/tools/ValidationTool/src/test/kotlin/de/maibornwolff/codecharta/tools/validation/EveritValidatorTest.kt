package de.maibornwolff.codecharta.tools.validation

import de.maibornwolff.codecharta.tools.validation.ValidationTool.Companion.SCHEMA_PATH
import org.everit.json.schema.ValidationException
import org.json.JSONException
import org.spekframework.spek2.Spek
import org.spekframework.spek2.style.specification.describe
import kotlin.test.assertFailsWith

class EveritValidatorTest : Spek({
    describe("a validator") {
        val validator = EveritValidator(SCHEMA_PATH)

        it("should validate valid File") {
            validator.validate(this.javaClass.classLoader.getResourceAsStream("validFile.json"))
        }

        it("should throw exception on missing node name") {
            assertFailsWith(ValidationException::class) {
                validator.validate(this.javaClass.classLoader.getResourceAsStream("missingNodeNameFile.json"))
            }
        }

        it("should throw exception on missing project") {
            assertFailsWith(ValidationException::class) {
                validator.validate(this.javaClass.classLoader.getResourceAsStream("invalidFile.json"))
            }
        }

        it("should throw exception if no json file") {
            assertFailsWith(JSONException::class) {
                validator.validate(this.javaClass.classLoader.getResourceAsStream("invalidJson.json"))
            }
        }
    }
})
