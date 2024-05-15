package de.maibornwolff.codecharta.importer.sonar

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import com.github.kinquirer.components.promptInput
import io.mockk.every
import io.mockk.mockkStatic
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import picocli.CommandLine

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ParserDialogTest {
    @AfterEach
    fun afterTest() {
        unmockkAll()
    }

    @Test
    fun `should output correct arguments when valid input is provided`() { // given
        val hostUrl = "https://sonar.foo"
        val projectKey = "de.foo:bar"
        val userToken = "c123d456"
        val outputFileName = "codecharta.cc.json"
        val metrics = "metric1, metric2"
        val compress = false
        val mergeModules = false

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns hostUrl andThen projectKey andThen userToken andThen outputFileName andThen metrics
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns compress andThen mergeModules

        // when
        val parserArguments = ParserDialog.collectParserArgs()
        val commandLine = CommandLine(SonarImporterMain())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<String>()).isEqualTo(hostUrl)
        Assertions.assertThat(parseResult.matchedPositional(1).getValue<String>()).isEqualTo(projectKey)
        Assertions.assertThat(parseResult.matchedOption("user-token").getValue<String>()).isEqualTo(userToken)
        Assertions.assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        Assertions.assertThat(parseResult.matchedOption("metrics").getValue<ArrayList<String>>())
            .isEqualTo(listOf("metric1", "metric2"))
        Assertions.assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(compress)
        Assertions.assertThat(parseResult.matchedOption("merge-modules").getValue<Boolean>()).isEqualTo(mergeModules)
    }

    @Test
    fun `should omit the metrics flag when metrics are empty`() { // given
        val hostUrl = "https://sonar.foo"
        val projectKey = "de.foo:bar"
        val userToken = "c123d456"
        val outputFileName = "codecharta.cc.json"
        val metrics = ""
        val compress = false
        val mergeModules = false

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns hostUrl andThen projectKey andThen userToken andThen outputFileName andThen metrics
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns compress andThen mergeModules

        // when
        val parserArguments = ParserDialog.collectParserArgs()
        val commandLine = CommandLine(SonarImporterMain())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<String>()).isEqualTo(hostUrl)
        Assertions.assertThat(parseResult.matchedPositional(1).getValue<String>()).isEqualTo(projectKey)
        Assertions.assertThat(parseResult.matchedOption("user-token").getValue<String>()).isEqualTo(userToken)
        Assertions.assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        Assertions.assertThat(parseResult.matchedOption("metrics")).isNull()
        Assertions.assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(compress)
        Assertions.assertThat(parseResult.matchedOption("merge-modules").getValue<Boolean>()).isEqualTo(mergeModules)
    }

    @Test
    fun `should omit the user-token flag when user-token is empty`() { // given
        val hostUrl = "https://sonar.foo"
        val projectKey = "de.foo:bar"
        val userToken = ""
        val outputFileName = "codecharta.cc.json"
        val metrics = "metric1, metric2"
        val compress = false
        val mergeModules = false

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns hostUrl andThen projectKey andThen userToken andThen outputFileName andThen metrics
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns compress andThen mergeModules

        // when
        val parserArguments = ParserDialog.collectParserArgs()
        val commandLine = CommandLine(SonarImporterMain())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<String>()).isEqualTo(hostUrl)
        Assertions.assertThat(parseResult.matchedPositional(1).getValue<String>()).isEqualTo(projectKey)
        Assertions.assertThat(parseResult.matchedOption("user-token")).isNull()
        Assertions.assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        Assertions.assertThat(parseResult.matchedOption("metrics").getValue<ArrayList<String>>())
            .isEqualTo(listOf("metric1", "metric2"))
        Assertions.assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(compress)
        Assertions.assertThat(parseResult.matchedOption("merge-modules").getValue<Boolean>()).isEqualTo(mergeModules)
    }

    @Test
    fun `should prompt user twice for host-url when first host-url is empty`() { // given
        val emptyHostUrl = ""
        val hostUrl = "https://sonar.foo"
        val projectKey = "de.foo:bar"
        val userToken = "c123d456"
        val outputFileName = "codecharta.cc.json"
        val metrics = "metric1, metric2"
        val compress = false
        val mergeModules = false

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns emptyHostUrl andThen hostUrl andThen projectKey andThen userToken andThen outputFileName andThen metrics
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns compress andThen mergeModules

        // when
        val parserArguments = ParserDialog.collectParserArgs()
        val commandLine = CommandLine(SonarImporterMain())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<String>()).isEqualTo(hostUrl)
    }

    @Test
    fun `should prompt user twice for project-key when first project-key is empty`() { // given
        val hostUrl = "https://sonar.foo"
        val emptyProjectKey = ""
        val projectKey = "de.foo:bar"
        val userToken = "c123d456"
        val outputFileName = "codecharta.cc.json"
        val metrics = "metric1, metric2"
        val compress = false
        val mergeModules = false

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns hostUrl andThen emptyProjectKey andThen projectKey andThen userToken andThen outputFileName andThen metrics
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns compress andThen mergeModules

        // when
        val parserArguments = ParserDialog.collectParserArgs()
        val commandLine = CommandLine(SonarImporterMain())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        // then
        Assertions.assertThat(parseResult.matchedPositional(1).getValue<String>()).isEqualTo(projectKey)
    }
}
