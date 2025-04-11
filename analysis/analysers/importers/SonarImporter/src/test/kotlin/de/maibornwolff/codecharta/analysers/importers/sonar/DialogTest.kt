package de.maibornwolff.codecharta.analysers.importers.sonar

import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.terminal.inmemory.press
import com.varabyte.kotter.runtime.terminal.inmemory.type
import com.varabyte.kotterx.test.foundation.testSession
import de.maibornwolff.codecharta.analysers.importers.sonar.Dialog.Companion.collectAnalyserArgs
import io.mockk.every
import io.mockk.mockkObject
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Timeout
import picocli.CommandLine

@Timeout(120)
class DialogTest {
    private val hostUrl = "https://sonar.foo"
    private val projectKey = "de.foo:bar"
    private val userToken = "c123d456"
    private val outputFileName = "codecharta.cc.json"
    private val metrics = "metric1, metric2"

    @BeforeEach
    fun setup() {
        mockkObject(Dialog.Companion)
    }

    @AfterEach
    fun cleanup() {
        unmockkAll()
    }

    @Test
    fun `should output correct arguments when valid input is provided`() {
        val mergeModules = false

        var parserArguments: List<String> = listOf()

        testSession { terminal ->
            val hostCallback: suspend RunScope.() -> Unit = {
                terminal.type(hostUrl)
                terminal.press(Keys.ENTER)
            }
            val projectCallback: suspend RunScope.() -> Unit = {
                terminal.type(projectKey)
                terminal.press(Keys.ENTER)
            }
            val tokenCallback: suspend RunScope.() -> Unit = {
                terminal.type(userToken)
                terminal.press(Keys.ENTER)
            }
            val outFileCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }
            val metricCallback: suspend RunScope.() -> Unit = {
                terminal.type(metrics)
                terminal.press(Keys.ENTER)
            }
            val mergeCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }

            every { Dialog.Companion.testCallback() } returnsMany listOf(
                hostCallback,
                projectCallback,
                tokenCallback,
                outFileCallback,
                metricCallback,
                mergeCallback
            )

            parserArguments = collectAnalyserArgs(this)
        }

        val commandLine = CommandLine(SonarImporter())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        assertThat(parseResult.matchedPositional(0).getValue<String>()).isEqualTo(hostUrl)
        assertThat(parseResult.matchedPositional(1).getValue<String>()).isEqualTo(projectKey)
        assertThat(parseResult.matchedOption("user-token").getValue<String>()).isEqualTo(userToken)
        assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo("")
        assertThat(parseResult.matchedOption("metrics").getValue<ArrayList<String>>())
            .isEqualTo(listOf("metric1", "metric2"))
        assertThat(parseResult.matchedOption("not-compressed")).isNull()
        assertThat(parseResult.matchedOption("merge-modules").getValue<Boolean>()).isEqualTo(mergeModules)
    }

    @Test
    fun `should omit the metrics flag when metrics are empty`() {
        val emptyMetrics = ""
        val compress = false
        val mergeModules = false

        var parserArguments: List<String> = listOf()

        testSession { terminal ->
            val hostCallback: suspend RunScope.() -> Unit = {
                terminal.type(hostUrl)
                terminal.press(Keys.ENTER)
            }
            val projectCallback: suspend RunScope.() -> Unit = {
                terminal.type(projectKey)
                terminal.press(Keys.ENTER)
            }
            val tokenCallback: suspend RunScope.() -> Unit = {
                terminal.type(userToken)
                terminal.press(Keys.ENTER)
            }
            val outFileCallback: suspend RunScope.() -> Unit = {
                terminal.type(outputFileName)
                terminal.press(Keys.ENTER)
            }
            val metricCallback: suspend RunScope.() -> Unit = {
                terminal.type(emptyMetrics)
                terminal.press(Keys.ENTER)
            }
            val compressCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }
            val mergeCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }

            every { Dialog.Companion.testCallback() } returnsMany listOf(
                hostCallback,
                projectCallback,
                tokenCallback,
                outFileCallback,
                metricCallback,
                compressCallback,
                mergeCallback
            )

            parserArguments = collectAnalyserArgs(this)
        }

        val commandLine = CommandLine(SonarImporter())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        assertThat(parseResult.matchedPositional(0).getValue<String>()).isEqualTo(hostUrl)
        assertThat(parseResult.matchedPositional(1).getValue<String>()).isEqualTo(projectKey)
        assertThat(parseResult.matchedOption("user-token").getValue<String>()).isEqualTo(userToken)
        assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        assertThat(parseResult.matchedOption("metrics")).isNull()
        assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(compress)
        assertThat(parseResult.matchedOption("merge-modules").getValue<Boolean>()).isEqualTo(mergeModules)
    }

    @Test
    fun `should omit the user-token flag when user-token is empty`() {
        val emptyUserToken = ""
        val compress = false
        val mergeModules = false

        var parserArguments: List<String> = listOf()

        testSession { terminal ->
            val hostCallback: suspend RunScope.() -> Unit = {
                terminal.type(hostUrl)
                terminal.press(Keys.ENTER)
            }
            val projectCallback: suspend RunScope.() -> Unit = {
                terminal.type(projectKey)
                terminal.press(Keys.ENTER)
            }
            val tokenCallback: suspend RunScope.() -> Unit = {
                terminal.type(emptyUserToken)
                terminal.press(Keys.ENTER)
            }
            val outFileCallback: suspend RunScope.() -> Unit = {
                terminal.type(outputFileName)
                terminal.press(Keys.ENTER)
            }
            val metricCallback: suspend RunScope.() -> Unit = {
                terminal.type(metrics)
                terminal.press(Keys.ENTER)
            }
            val compressCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }
            val mergeCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }

            every { Dialog.Companion.testCallback() } returnsMany listOf(
                hostCallback,
                projectCallback,
                tokenCallback,
                outFileCallback,
                metricCallback,
                compressCallback,
                mergeCallback
            )

            parserArguments = collectAnalyserArgs(this)
        }

        val commandLine = CommandLine(SonarImporter())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        assertThat(parseResult.matchedPositional(0).getValue<String>()).isEqualTo(hostUrl)
        assertThat(parseResult.matchedPositional(1).getValue<String>()).isEqualTo(projectKey)
        assertThat(parseResult.matchedOption("user-token")).isNull()
        assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        assertThat(parseResult.matchedOption("metrics").getValue<ArrayList<String>>())
            .isEqualTo(listOf("metric1", "metric2"))
        assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(compress)
        assertThat(parseResult.matchedOption("merge-modules").getValue<Boolean>()).isEqualTo(mergeModules)
    }

    @Test
    fun `should prompt user twice for host-url when first host-url is empty`() {
        val emptyHostUrl = ""

        var parserArguments: List<String> = listOf()

        testSession { terminal ->
            val hostCallback: suspend RunScope.() -> Unit = {
                terminal.type(emptyHostUrl)
                terminal.press(Keys.ENTER)
                terminal.type(hostUrl)
                terminal.press(Keys.ENTER)
            }
            val projectCallback: suspend RunScope.() -> Unit = {
                terminal.type(projectKey)
                terminal.press(Keys.ENTER)
            }
            val tokenCallback: suspend RunScope.() -> Unit = {
                terminal.type(userToken)
                terminal.press(Keys.ENTER)
            }
            val outFileCallback: suspend RunScope.() -> Unit = {
                terminal.type(outputFileName)
                terminal.press(Keys.ENTER)
            }
            val metricCallback: suspend RunScope.() -> Unit = {
                terminal.type(metrics)
                terminal.press(Keys.ENTER)
            }
            val compressCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }
            val mergeCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }

            every { Dialog.Companion.testCallback() } returnsMany listOf(
                hostCallback,
                projectCallback,
                tokenCallback,
                outFileCallback,
                metricCallback,
                compressCallback,
                mergeCallback
            )

            parserArguments = collectAnalyserArgs(this)
        }

        val commandLine = CommandLine(SonarImporter())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        assertThat(parseResult.matchedPositional(0).getValue<String>()).isEqualTo(hostUrl)
    }

    @Test
    fun `should prompt user twice for project-key when first project-key is empty`() {
        val emptyProjectKey = ""

        var parserArguments: List<String> = listOf()

        testSession { terminal ->
            val hostCallback: suspend RunScope.() -> Unit = {
                terminal.type(hostUrl)
                terminal.press(Keys.ENTER)
            }
            val projectCallback: suspend RunScope.() -> Unit = {
                terminal.type(emptyProjectKey)
                terminal.press(Keys.ENTER)
                terminal.type(projectKey)
                terminal.press(Keys.ENTER)
            }
            val tokenCallback: suspend RunScope.() -> Unit = {
                terminal.type(userToken)
                terminal.press(Keys.ENTER)
            }
            val outFileCallback: suspend RunScope.() -> Unit = {
                terminal.type(outputFileName)
                terminal.press(Keys.ENTER)
            }
            val metricCallback: suspend RunScope.() -> Unit = {
                terminal.type(metrics)
                terminal.press(Keys.ENTER)
            }
            val compressCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }
            val mergeCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }

            every { Dialog.Companion.testCallback() } returnsMany listOf(
                hostCallback,
                projectCallback,
                tokenCallback,
                outFileCallback,
                metricCallback,
                compressCallback,
                mergeCallback
            )

            parserArguments = collectAnalyserArgs(this)
        }

        val commandLine = CommandLine(SonarImporter())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        assertThat(parseResult.matchedPositional(1).getValue<String>()).isEqualTo(projectKey)
    }
}
