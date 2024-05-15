package de.maibornwolff.codecharta.util

import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test

class FileExtensionConverterTest {
    @Test
    fun `should return empty list for null input`() {
        val input = null

        val fileExtensionConverter = FileExtensionConverter()
        val result = fileExtensionConverter.convert(input)
        val expected = listOf<String>()

        Assertions.assertThat(result).isEqualTo(expected)
    }

    @Test
    fun `should return empty list for empty string input`() {
        val input = ""

        val fileExtensionConverter = FileExtensionConverter()
        val result = fileExtensionConverter.convert(input)
        val expected = listOf<String>()

        Assertions.assertThat(result).isEqualTo(expected)
    }

    @Test
    fun `should return list with single entry for single string input`() {
        val input = "entry"

        val fileExtensionConverter = FileExtensionConverter()
        val result = fileExtensionConverter.convert(input)
        val expected = listOf(input)

        Assertions.assertThat(result).isEqualTo(expected)
    }

    @Test
    fun `should return list with all entries for input string with multiple values`() {
        val input = "entry1, entry2, entry3"

        val fileExtensionConverter = FileExtensionConverter()
        val result = fileExtensionConverter.convert(input)
        val expected = listOf("entry1", "entry2", "entry3")

        Assertions.assertThat(result).isEqualTo(expected)
    }

    @Test
    fun `should remove whitespace for all entries`() {
        val input = "  entry1  ,   entry2,  entry3, \n, \t, \r"

        val fileExtensionConverter = FileExtensionConverter()
        val result = fileExtensionConverter.convert(input)
        val expected = listOf("entry1", "entry2", "entry3")

        Assertions.assertThat(result).isEqualTo(expected)
    }

    @Test
    fun `should return all but empty entries for input string with multiple values`() {
        val input = "entry1, , entry2, , ,entry3"

        val fileExtensionConverter = FileExtensionConverter()
        val result = fileExtensionConverter.convert(input)
        val expected = listOf("entry1", "entry2", "entry3")

        Assertions.assertThat(result).isEqualTo(expected)
    }

    @Test
    fun `should return empty list for input string with empty values only`() {
        val input = " ,   ,   , ,,"

        val fileExtensionConverter = FileExtensionConverter()
        val result = fileExtensionConverter.convert(input)
        val expected = listOf<String>()

        Assertions.assertThat(result).isEqualTo(expected)
    }

    @Test
    fun `should remove dots for all entries`() {
        val input = ".entry1, .entry2, .entry3"

        val fileExtensionConverter = FileExtensionConverter()
        val result = fileExtensionConverter.convert(input)
        val expected = listOf("entry1", "entry2", "entry3")

        Assertions.assertThat(result).isEqualTo(expected)
    }
}
