package de.maibornwolff.codecharta.util

import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test

class StringToListInputConverterTest {

    @Test
    fun `should return empty list for null input`() {
        val input = null

        val stringToListInputConverter = StringToListInputConverter()
        val result = stringToListInputConverter.convert(input)
        val expected = listOf<String>()

        Assertions.assertThat(result).isEqualTo(expected)
    }

    @Test
    fun `should return empty list for empty string input`() {
        val input = ""

        val stringToListInputConverter = StringToListInputConverter()
        val result = stringToListInputConverter.convert(input)
        val expected = listOf<String>()

        Assertions.assertThat(result).isEqualTo(expected)
    }

    @Test
    fun `should return list with single entry for single string input`() {
        val input = "entry"

        val stringToListInputConverter = StringToListInputConverter()
        val result = stringToListInputConverter.convert(input)
        val expected = listOf(input)

        Assertions.assertThat(result).isEqualTo(expected)
    }

    @Test
    fun `should return list with all entries for input string with multiple values`() {
        val input = "entry1, entry2, entry3"

        val stringToListInputConverter = StringToListInputConverter()
        val result = stringToListInputConverter.convert(input)
        val expected = listOf("entry1", "entry2", "entry3")

        Assertions.assertThat(result).isEqualTo(expected)
    }

    @Test
    fun `should remove whitespace for all entries`() {
        val input = "  entry1  ,   entry2,  entry3, \n, \t, \r"

        val stringToListInputConverter = StringToListInputConverter()
        val result = stringToListInputConverter.convert(input)
        val expected = listOf("entry1", "entry2", "entry3")

        Assertions.assertThat(result).isEqualTo(expected)
    }

    @Test
    fun `should return all but empty entries for input string with multiple values`() {
        val input = "entry1, , entry2, , ,entry3"

        val stringToListInputConverter = StringToListInputConverter()
        val result = stringToListInputConverter.convert(input)
        val expected = listOf("entry1", "entry2", "entry3")

        Assertions.assertThat(result).isEqualTo(expected)
    }

    @Test
    fun `should return empty list for input string with empty values only`() {
        val input = " ,   ,   , ,,"

        val stringToListInputConverter = StringToListInputConverter()
        val result = stringToListInputConverter.convert(input)
        val expected = listOf<String>()

        Assertions.assertThat(result).isEqualTo(expected)
    }
}
