package de.maibornwolff.codecharta.importer.sonar

import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.runtime.terminal.inmemory.press
import com.varabyte.kotter.runtime.terminal.inmemory.type
import com.varabyte.kotterx.test.foundation.testSession
import de.maibornwolff.codecharta.importer.sonar.ParserDialog.Companion.myCollectParserArgs
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.api.Timeout
import picocli.CommandLine

@Timeout(120)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ParserDialogTest {
    private val hostUrl = "https://sonar.foo"
    private val projectKey = "de.foo:bar"
    private val userToken = "c123d456"
    private val outputFileName = "codecharta.cc.json"
    private val metrics = "metric1, metric2"

    @Test
    fun `should output correct arguments when valid input is provided`() {
        val compress = false
        val mergeModules = false

        testSession { terminal ->
            val parserArguments = myCollectParserArgs(
                hostCallback = {
                    terminal.type(hostUrl)
                    terminal.press(Keys.ENTER)
                },
                projectCallback = {
                    terminal.type(projectKey)
                    terminal.press(Keys.ENTER)
                },
                tokenCallback = {
                    terminal.type(userToken)
                    terminal.press(Keys.ENTER)
                },
                outFileCallback = {
                    terminal.type(outputFileName)
                    terminal.press(Keys.ENTER)
                },
                metricCallback = {
                    terminal.type(metrics)
                    terminal.press(Keys.ENTER)
                },
                compressCallback = {
                    terminal.press(Keys.RIGHT)
                    terminal.press(Keys.ENTER)
                },
                mergeCallback = {
                    terminal.press(Keys.RIGHT)
                    terminal.press(Keys.ENTER)
                }
            )

            val commandLine = CommandLine(SonarImporterMain())
            val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

            // then
            assertThat(parseResult.matchedPositional(0).getValue<String>()).isEqualTo(hostUrl)
            assertThat(parseResult.matchedPositional(1).getValue<String>()).isEqualTo(projectKey)
            assertThat(parseResult.matchedOption("user-token").getValue<String>()).isEqualTo(userToken)
            assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
            assertThat(parseResult.matchedOption("metrics").getValue<ArrayList<String>>())
                .isEqualTo(listOf("metric1", "metric2"))
            assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(compress)
            assertThat(parseResult.matchedOption("merge-modules").getValue<Boolean>()).isEqualTo(mergeModules)
        }
    }

    @Test
    fun `should omit the metrics flag when metrics are empty`() {
        val emptyMetrics = ""
        val compress = false
        val mergeModules = false

        testSession { terminal ->
            val parserArguments = myCollectParserArgs(
                hostCallback = {
                    terminal.type(hostUrl)
                    terminal.press(Keys.ENTER)
                },
                projectCallback = {
                    terminal.type(projectKey)
                    terminal.press(Keys.ENTER)
                },
                tokenCallback = {
                    terminal.type(userToken)
                    terminal.press(Keys.ENTER)
                },
                outFileCallback = {
                    terminal.type(outputFileName)
                    terminal.press(Keys.ENTER)
                },
                metricCallback = {
                    terminal.type(emptyMetrics)
                    terminal.press(Keys.ENTER)
                },
                compressCallback = {
                    terminal.press(Keys.RIGHT)
                    terminal.press(Keys.ENTER)
                },
                mergeCallback = {
                    terminal.press(Keys.RIGHT)
                    terminal.press(Keys.ENTER)
                }
            )

            val commandLine = CommandLine(SonarImporterMain())
            val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

            assertThat(parseResult.matchedPositional(0).getValue<String>()).isEqualTo(hostUrl)
            assertThat(parseResult.matchedPositional(1).getValue<String>()).isEqualTo(projectKey)
            assertThat(parseResult.matchedOption("user-token").getValue<String>()).isEqualTo(userToken)
            assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
            assertThat(parseResult.matchedOption("metrics")).isNull()
            assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(compress)
            assertThat(parseResult.matchedOption("merge-modules").getValue<Boolean>()).isEqualTo(mergeModules)
        }
    }

    @Test
    fun `should omit the user-token flag when user-token is empty`() {
        val emptyUserToken = ""
        val compress = false
        val mergeModules = false

        testSession { terminal ->
            val parserArguments = myCollectParserArgs(
                hostCallback = {
                    terminal.type(hostUrl)
                    terminal.press(Keys.ENTER)
                },
                projectCallback = {
                    terminal.type(projectKey)
                    terminal.press(Keys.ENTER)
                },
                tokenCallback = {
                    terminal.type(emptyUserToken)
                    terminal.press(Keys.ENTER)
                },
                outFileCallback = {
                    terminal.type(outputFileName)
                    terminal.press(Keys.ENTER)
                },
                metricCallback = {
                    terminal.type(metrics)
                    terminal.press(Keys.ENTER)
                },
                compressCallback = {
                    terminal.press(Keys.RIGHT)
                    terminal.press(Keys.ENTER)
                },
                mergeCallback = {
                    terminal.press(Keys.RIGHT)
                    terminal.press(Keys.ENTER)
                }
            )

            val commandLine = CommandLine(SonarImporterMain())
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
    }

    @Test
    fun `should prompt user twice for host-url when first host-url is empty`() {
        val emptyHostUrl = ""

        testSession { terminal ->
            val parserArguments = myCollectParserArgs(
                hostCallback = {
                    terminal.type(emptyHostUrl)
                    terminal.press(Keys.ENTER)
                    terminal.type(hostUrl)
                    terminal.press(Keys.ENTER)
                },
                projectCallback = {
                    terminal.type(projectKey)
                    terminal.press(Keys.ENTER)
                },
                tokenCallback = {
                    terminal.type(userToken)
                    terminal.press(Keys.ENTER)
                },
                outFileCallback = {
                    terminal.type(outputFileName)
                    terminal.press(Keys.ENTER)
                },
                metricCallback = {
                    terminal.type(metrics)
                    terminal.press(Keys.ENTER)
                },
                compressCallback = {
                    terminal.press(Keys.RIGHT)
                    terminal.press(Keys.ENTER)
                },
                mergeCallback = {
                    terminal.press(Keys.RIGHT)
                    terminal.press(Keys.ENTER)
                }
            )

            val commandLine = CommandLine(SonarImporterMain())
            val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

            assertThat(parseResult.matchedPositional(0).getValue<String>()).isEqualTo(hostUrl)
        }
    }

    @Test
    fun `should prompt user twice for project-key when first project-key is empty`() {
        val emptyProjectKey = ""

        testSession { terminal ->
            val parserArguments = myCollectParserArgs(
                hostCallback = {
                    terminal.type(hostUrl)
                    terminal.press(Keys.ENTER)
                },
                projectCallback = {
                    terminal.type(emptyProjectKey)
                    terminal.press(Keys.ENTER)
                    terminal.type(projectKey)
                    terminal.press(Keys.ENTER)
                },
                tokenCallback = {
                    terminal.type(userToken)
                    terminal.press(Keys.ENTER)
                },
                outFileCallback = {
                    terminal.type(outputFileName)
                    terminal.press(Keys.ENTER)
                },
                metricCallback = {
                    terminal.type(metrics)
                    terminal.press(Keys.ENTER)
                },
                compressCallback = {
                    terminal.press(Keys.RIGHT)
                    terminal.press(Keys.ENTER)
                },
                mergeCallback = {
                    terminal.press(Keys.RIGHT)
                    terminal.press(Keys.ENTER)
                }
            )

            val commandLine = CommandLine(SonarImporterMain())
            val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

            assertThat(parseResult.matchedPositional(1).getValue<String>()).isEqualTo(projectKey)
        }
    }
}
