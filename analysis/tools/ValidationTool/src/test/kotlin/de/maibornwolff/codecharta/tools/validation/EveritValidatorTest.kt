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

        it("should extract and validate a valid file") {
            validator.validate(this.javaClass.classLoader.getResourceAsStream("validCompressed.gz"))
        }

        it("should throw exception if extracted file is invalid json") {
            assertFailsWith(JSONException::class) {
                validator.validate(this.javaClass.classLoader.getResourceAsStream("invalidJSONCompressed.gz"))
            }
        }

        it("should throw exception on compressed json with no project") {
            assertFailsWith(ValidationException::class) {
                validator.validate(this.javaClass.classLoader.getResourceAsStream("invalidProjectCompressed.gz"))
            }
        }

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
