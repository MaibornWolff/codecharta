package de.maibornwolff.codecharta.translator

import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers.`is`
import org.spekframework.spek2.Spek
import org.spekframework.spek2.style.specification.describe
import kotlin.test.assertFailsWith

class MetricNameTranslatorTest: Spek({
    describe("trivial replacer") {
        val replacer = MetricNameTranslator.TRIVIAL
        it("should not replace anything") {
            val original = "testestest"
            assertThat(replacer.translate(original), `is`(original))
        }
    }

    describe("replacer without specified prefix") {
        val original = "oldValue"
        val replacement = "newString"
        val replacer = MetricNameTranslator(mapOf(Pair(original, replacement)))

        it("should replace specified string") {
            assertThat(replacer.translate(original), `is`(replacement))
        }

        it("should not replace other string") {
            val otherString = "testestest"
            assertThat(replacer.translate(otherString), `is`(otherString))
        }
    }

    describe("replacer with prefix") {
        val original = "oldValue"
        val replacement = "newString"
        val replacer = MetricNameTranslator(mapOf(Pair(original, replacement)), "pre_")

        it("should replace specified string") {
            assertThat(replacer.translate(original), `is`(replacement))
        }

        it("should prefix other string with underscores") {
            assertThat(replacer.translate("some String"), `is`("pre_some_string"))
        }
    }

    describe("A replacer") {
        val replacer = MetricNameTranslator(mapOf(
                Pair("this", "oooo"),
                Pair("that", "iiii"),
                Pair("bla", "blubb"))
        )

        it("should replaceMany") {
            val original: Array<String?> = arrayOf("this", "that", "other", null)
            val expected: Array<String?> = arrayOf("oooo", "iiii", "other", null)

            assertThat(replacer.translate(original), `is`(expected))
        }
    }

    describe("A translator with same values") {
        it("should not validate") {
            assertFailsWith(IllegalArgumentException::class) {
                MetricNameTranslator(mapOf(Pair("this", "that"), Pair("these", "that")))
            }
        }

        describe("A translator with multiple empty values") {
            val translator = MetricNameTranslator(mapOf(Pair("this", ""), Pair("these", "")))

            it("should validate") {
                assertThat(translator.translate("this"), `is`(""))
                assertThat(translator.translate("these"), `is`(""))
            }
        }
    }
})