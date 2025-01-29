package de.maibornwolff.codecharta.tools.ccsh.parser

import com.varabyte.kotter.foundation.session
import com.varabyte.kotter.runtime.RunScope
import de.maibornwolff.codecharta.tools.inquirer.InputType
import de.maibornwolff.codecharta.tools.inquirer.myPromptCheckbox
import de.maibornwolff.codecharta.tools.inquirer.myPromptConfirm
import de.maibornwolff.codecharta.tools.inquirer.myPromptInput
import de.maibornwolff.codecharta.tools.inquirer.myPromptList
import de.maibornwolff.codecharta.tools.inquirer.util.InputValidator
import java.nio.file.Paths

class InteractiveDialog {
    companion object {
        internal val askParserToExecute: (List<String>, suspend RunScope.() -> Unit) -> String = { parserOptions, parserCallback ->
            var selectedParser = ""
            session {
                selectedParser = myPromptList(
                    message = "Which parser do you want to execute?",
                    choices = parserOptions,
                    onInputReady = parserCallback
                )
            }
            selectedParser
        }

        fun callAskParserToExecute(parserOptions: List<String>): String {
            return askParserToExecute(parserOptions) {}
        }

        internal val askForPath: (suspend RunScope.() -> Unit) -> String = { pathCallback ->
            var inputFilePath = ""
            println("You can provide a directory path / file path / sonar url.")
            session {
                inputFilePath = myPromptInput(
                    message = "Which path should be scanned?",
                    hint = Paths.get("").toAbsolutePath().toString(),
                    allowEmptyInput = false,
                    onInputReady = pathCallback
                )
            }
            inputFilePath
        }

        fun callAskForPath(): String {
            return askForPath {}
        }

        internal val askApplicableParser: (List<String>, suspend RunScope.() -> Unit) -> List<String> =
            { applicableParsers, applicableCallback ->
                var selectedParsers: List<String> = listOf()
                session {
                    selectedParsers = myPromptCheckbox(
                        message = "Choose from this list of applicable parsers. You can select individual parsers by pressing spacebar.",
                        choices = applicableParsers,
                        allowEmptyInput = true,
                        onInputReady = applicableCallback
                    )
                }
                selectedParsers
            }

        fun callAskApplicableParser(applicableParsers: List<String>): List<String> {
            return askApplicableParser(applicableParsers) {}
        }

        internal val askRunParsers: (suspend RunScope.() -> Unit) -> Boolean = { runCallback ->
            var shouldRunConfiguredParsers = true

            session {
                shouldRunConfiguredParsers = myPromptConfirm(
                    message = "Do you want to run all configured parsers now?",
                    onInputReady = runCallback
                )
            }
            shouldRunConfiguredParsers
        }

        fun callAskRunParsers(): Boolean {
            return askRunParsers {}
        }

        internal val askForMerge: (suspend RunScope.() -> Unit) -> Boolean = { mergeCallback ->
            var shouldMerge = false

            session {
                shouldMerge = myPromptConfirm(
                    message = "Do you want to merge all generated files into one result now?",
                    onInputReady = mergeCallback
                )
            }
            shouldMerge
        }

        fun callAskForMerge(): Boolean {
            return askForMerge {}
        }

        internal val askJsonPath: (suspend RunScope.() -> Unit) -> String = { jsonCallback ->
            println(
                "If you did not output all cc.json files into the same folder, " +
                    "you need to manually move them there before trying to merge."
            )
            var ccJsonFilePath = ""
            session {
                ccJsonFilePath = myPromptInput(
                    message = "What is the folder path containing all cc.json files?",
                    hint = Paths.get("").toAbsolutePath().toString(),
                    inputValidator = InputValidator.isFileOrFolderValid(InputType.FOLDER, listOf()),
                    onInputReady = jsonCallback
                )
            }
            ccJsonFilePath
        }

        fun callAskJsonPath(): String {
            return askJsonPath {}
        }
    }
}
