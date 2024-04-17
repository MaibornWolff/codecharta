package de.maibornwolff.codecharta.util

import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import java.util.Stack

class CommaSeparatedParameterPreprocessorTest {
@Test
    fun `should return false when input is null`() {
        // given
        val input = null

        // when
        val commaSeparatedParameterPreprocessor = CommaSeparatedParameterPreprocessor()
        val result = commaSeparatedParameterPreprocessor.preprocess(input, null, null, null)

        // then
        Assertions.assertThat(result).isEqualTo(false)
    }

    @Test
    fun `should return false when input is empty`() {
        // given
        val args = Stack<String>()

        // when
        val commaSeparatedParameterPreprocessor = CommaSeparatedParameterPreprocessor()
        commaSeparatedParameterPreprocessor.preprocess(args, null, null, null)

        // then
        Assertions.assertThat(args).isEmpty()
    }

    @Test
    fun `should merge multiple values into one when given multiple values for one option`() {
        // given
        val args = Stack<String>()
        args.push("second")
        args.push("first,")
        val expected = Stack<String>()
        expected.push("first,second")

        // when
        val commaSeparatedParameterPreprocessor = CommaSeparatedParameterPreprocessor()
        commaSeparatedParameterPreprocessor.preprocess(args, null, null, null)

        // then
        Assertions.assertThat(args).isEqualTo(expected)
    }
}
