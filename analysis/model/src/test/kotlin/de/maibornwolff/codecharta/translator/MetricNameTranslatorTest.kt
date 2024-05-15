package de.maibornwolff.codecharta.translator

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import kotlin.test.assertFailsWith

class MetricNameTranslatorTest {
    @Test
    fun `trivial replacer should not replace anything`() {
        val replacer = MetricNameTranslator.TRIVIAL
        val original = "testestest"
        assertThat(replacer.translate(original)).isEqualTo(original)
    }

    @Test
    fun `replacer without specified prefix should replace specified string`() {
        val original = "oldValue"
        val replacement = "newString"
        val replacer = MetricNameTranslator(mapOf(Pair(original, replacement)))
        assertThat(replacer.translate(original)).isEqualTo(replacement)
    }

    @Test
    fun `replacer without specified prefix should not replace other string`() {
        val original = "oldValue"
        val replacement = "newString"
        val replacer = MetricNameTranslator(mapOf(Pair(original, replacement)))
        val otherString = "testestest"
        assertThat(replacer.translate(otherString)).isEqualTo(otherString)
    }

    @Test
    fun `replacer with prefix should replace specified string`() {
        val original = "oldValue"
        val replacement = "newString"
        val replacer = MetricNameTranslator(mapOf(Pair(original, replacement)), "pre_")
        assertThat(replacer.translate(original)).isEqualTo(replacement)
    }

    @Test
    fun `replacer with prefix should prefix other string with underscores`() {
        val original = "oldValue"
        val replacement = "newString"
        val replacer = MetricNameTranslator(mapOf(Pair(original, replacement)), "pre_")
        assertThat(replacer.translate("some String")).isEqualTo("pre_some_string")
    }

    @Test
    fun `replacer should replaceMany`() {
        val replacer =
            MetricNameTranslator(
                mapOf(
                    Pair("this", "oooo"),
                    Pair("that", "iiii"),
                    Pair("bla", "blubb")
                )
            )

        val original: Array<String?> = arrayOf("this", "that", "other", null)
        val expected: Array<String?> = arrayOf("oooo", "iiii", "other", null)

        assertThat(replacer.translate(original)).isEqualTo(expected)
    }

    @Test
    fun `translator with same values should not validate`() {
        assertFailsWith(IllegalArgumentException::class) {
            MetricNameTranslator(mapOf(Pair("this", "that"), Pair("these", "that")))
        }
    }

    @Test
    fun `translator with multiple empty values should validate`() {
        val translator = MetricNameTranslator(mapOf(Pair("this", ""), Pair("these", "")))
        assertThat(translator.translate("this")).isEqualTo("")
        assertThat(translator.translate("these")).isEqualTo("")
    }
}
