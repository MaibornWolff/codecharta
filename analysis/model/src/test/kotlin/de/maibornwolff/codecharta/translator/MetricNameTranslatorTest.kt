package de.maibornwolff.codecharta.translator

import com.google.common.collect.ImmutableMap
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
        val replacer = MetricNameTranslator(ImmutableMap.of(original, replacement))

        assertThat(replacer.translate(original), `is`(replacement))
    }

    @Test
    @Throws(Exception::class)
    fun should_replace_other_string_with_prefixed_underscored_lowercase() {
        val original = "some String"
        val expected = "pre_some_string"
        val replacer = MetricNameTranslator(ImmutableMap.of("oldValue", "newValue"), "pre_")

        assertThat(replacer.translate(original), `is`(expected))
    }

    @Test
    @Throws(Exception::class)
    fun should_replaceMany() {
        val original: Array<String?> = arrayOf("this", "that", "other")
        val expected: Array<String?> = arrayOf("oooo", "iiii", "other")
        val replacer = MetricNameTranslator(ImmutableMap.of("this", "oooo", "that", "iiii", "bla", "blubb"))

        assertThat(replacer.translate(original), `is`(expected))
    }

    @Test(expected = IllegalArgumentException::class)
    fun should_not_validate_with_same_values() {
        MetricNameTranslator(ImmutableMap.of("this", "that", "these", "that"))
    }

    @Test
    fun should_validate_with_multiple_empty_values() {
        val translator = MetricNameTranslator(ImmutableMap.of("this", "", "these", ""))

        assertThat(translator.translate("this"), `is`(""))
        assertThat(translator.translate("these"), `is`(""))
    }
}