package de.maibornwolff.codecharta.translator

import org.hamcrest.CoreMatchers.`is`
import org.junit.Assert.assertThat
import org.junit.Test

class MetricNameTranslatorTest {
    @Test
    @Throws(Exception::class)
    fun should_replace_nothing() {
        val original = "testestest"
        val replacer = MetricNameTranslator.TRIVIAL

        assertThat(replacer.translate(original), `is`(original))
    }

    @Test
    @Throws(Exception::class)
    fun should_replace_specified_string() {
        val original = "oldValue"
        val replacement = "newString"
        val replacer = MetricNameTranslator(mapOf(Pair(original, replacement)))

        assertThat(replacer.translate(original), `is`(replacement))
    }

    @Test
    @Throws(Exception::class)
    fun should_replace_other_string_with_prefixed_underscored_lowercase() {
        val original = "some String"
        val expected = "pre_some_string"
        val replacer = MetricNameTranslator(mapOf(Pair("oldValue", "newValue")), "pre_")

        assertThat(replacer.translate(original), `is`(expected))
    }

    @Test
    @Throws(Exception::class)
    fun should_replaceMany() {
        val original: Array<String?> = arrayOf("this", "that", "other")
        val expected: Array<String?> = arrayOf("oooo", "iiii", "other")
        val replacer = MetricNameTranslator(mapOf(
                Pair("this", "oooo"),
                Pair("that", "iiii"),
                Pair("bla", "blubb"))
        )

        assertThat(replacer.translate(original), `is`(expected))
    }

    @Test(expected = IllegalArgumentException::class)
    fun should_not_validate_with_same_values() {
        MetricNameTranslator(mapOf(Pair("this", "that"), Pair("these", "that")))
    }

    @Test
    fun should_validate_with_multiple_empty_values() {
        val translator = MetricNameTranslator(mapOf(Pair("this", ""), Pair("these", "")))

        assertThat(translator.translate("this"), `is`(""))
        assertThat(translator.translate("these"), `is`(""))
    }
}