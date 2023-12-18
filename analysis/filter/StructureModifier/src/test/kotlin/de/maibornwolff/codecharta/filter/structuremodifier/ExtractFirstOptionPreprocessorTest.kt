package de.maibornwolff.codecharta.filter.structuremodifier

import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import java.util.*

class ExtractFirstOptionPreprocessorTest {

    @Test
    fun `should remove extra options when more than one was given`() {
        // given
        val args = Stack<String>()
        args.push("-o=out1")
        args.push("--remove=/root/src/test/io")
        args.push("/root/src/test/io")
        val expected = Stack<String>()
        expected.push("-o=out1")
        expected.push("/root/src/test/io")

        // when
        val extractFirstOptionPreprocessor = ExtractFirstOptionPreprocessor()
        extractFirstOptionPreprocessor.preprocess(args, null, null, null)

        // then
        Assertions.assertThat(args).isEqualTo(expected)
    }

}
