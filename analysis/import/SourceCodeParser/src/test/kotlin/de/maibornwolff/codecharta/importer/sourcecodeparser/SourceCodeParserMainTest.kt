package de.maibornwolff.codecharta.importer.sourcecodeparser

import org.assertj.core.api.Assertions
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.MethodSource

class SourceCodeParserMainTest {

    companion object {
        @JvmStatic
        fun provideValidInputFiles(): List<Arguments> {
            return listOf(
                    Arguments.of("src/test/resources/my/java/repo"),
                    Arguments.of("src/test/resources/my/java/repo/hello_world.java"),
                    Arguments.of("src/test/resources/my"),
                    Arguments.of(""))
        }

        @JvmStatic
        fun provideInvalidInputFiles(): List<Arguments> {
            return listOf(
                    Arguments.of("src/test/resources/my/empty/repo"),
                    Arguments.of("src/test/resources/this/does/not/exist"),
                    Arguments.of("src/test/resources/my/non-java/repo"))
        }
    }

    @ParameterizedTest
    @MethodSource("provideValidInputFiles")
    fun `should be identified as applicable for given directory path containing a java file`(resourceToBeParsed: String) {
        val isUsable = SourceCodeParserMain().isApplicable(resourceToBeParsed)
        Assertions.assertThat(isUsable).isTrue()
    }

    @ParameterizedTest
    @MethodSource("provideInvalidInputFiles")
    fun `should NOT be identified as applicable if no java file is present at given path`(resourceToBeParsed: String) {
        val isUsable = SourceCodeParserMain().isApplicable(resourceToBeParsed)
        Assertions.assertThat(isUsable).isFalse()
    }
}
