package de.maibornwolff.codecharta.importer.sonar

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import com.github.kinquirer.components.promptInput
import io.mockk.every
import io.mockk.mockkStatic
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.MethodSource

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ParserDialogTest {

    @AfterAll
    fun afterTest() {
        unmockkAll()
    }

    @ParameterizedTest
    @MethodSource("provideArguments")
    fun `should output correct arguments`(
        hostUrl: String,
        projectKey: String,
        user: String,
        outputFileName: String,
        metrics: String,
        compress: Boolean,
        mergeModules: Boolean,
    ) {
        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns hostUrl andThen projectKey andThen user andThen outputFileName andThen metrics
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns compress andThen mergeModules

        val parserArguments = ParserDialog.collectParserArgs()

        Assertions.assertThat(parserArguments).isEqualTo(
            listOf(
                hostUrl,
                projectKey,
                "--user=$user",
                "--output-file=$outputFileName",
                "--metrics=$metrics",
                "--not-compressed=$compress",
                "--merge-modules=$mergeModules",
            )
        )
    }

    companion object {
        @JvmStatic
        fun provideArguments(): List<Arguments> {
            return listOf(
                Arguments.of(
                    "https://sonar.foo", "de.foo:bar", "c123d456","codecharta.cc.json", "metric1, metric2", false, false
                ), Arguments.of(
                    "", "de.foo:bar", "c123d456","codecharta.cc.json", "metric1, metric2", false, false
                )
            )
        }
    }
}
