package de.maibornwolff.codecharta.tools.ccsh.parser

import com.varabyte.kotter.runtime.RunScope
import de.maibornwolff.codecharta.tools.inquirer.InputType
import de.maibornwolff.codecharta.tools.inquirer.myPromptCheckbox
import de.maibornwolff.codecharta.tools.inquirer.myPromptConfirm
import de.maibornwolff.codecharta.tools.inquirer.myPromptInput
import de.maibornwolff.codecharta.tools.inquirer.myPromptList
import de.maibornwolff.codecharta.tools.inquirer.util.InputValidator
import de.maibornwolff.codecharta.tools.interactiveparser.startSession
import java.nio.file.Paths

class InteractiveDialog {
    companion object {
        internal fun askParserToExecute(parserOptions: List<String>): String {
            return startSession {
                myPromptList(
                    message = "Which parser do you want to execute?",
                    choices = parserOptions,
                    onInputReady = parserCallback()
                )
            }
        }

        internal fun askForPath(): String {
            println("You can provide a directory path / file path / sonar url.")
            return startSession {
                myPromptInput(
                    message = "Which path should be scanned?",
                    hint = Paths.get("").toAbsolutePath().toString(),
                    allowEmptyInput = false,
                    onInputReady = pathCallback()
                )
            }
        }

        internal fun askApplicableParser(applicableParsers: List<String>): List<String> {
            return startSession {
                myPromptCheckbox(
                    message = "Choose from this list of applicable parsers. You can select individual parsers by pressing spacebar.",
                    choices = applicableParsers,
                    allowEmptyInput = true,
                    onInputReady = applicableCallback()
                )
            }
        }

        internal fun askRunParsers(): Boolean {
            return startSession {
                myPromptConfirm(
                    message = "Do you want to run all configured parsers now?",
                    onInputReady = runCallback()
                )
            }
        }

        internal fun askForMerge(): Boolean {
            return startSession {
                myPromptConfirm(
                    message = "Do you want to merge all generated files into one result now?",
                    onInputReady = mergeCallback()
                )
            }
        }

        internal fun askJsonPath(): String {
            println(
                "If you did not output all cc.json files into the same folder, " +
                    "you need to manually move them there before trying to merge."
            )
            return startSession {
                myPromptInput(
                    message = "What is the folder path containing all cc.json files?",
                    hint = Paths.get("").toAbsolutePath().toString(),
                    inputValidator = InputValidator.isFileOrFolderValid(InputType.FOLDER, listOf()),
                    onInputReady = jsonCallback()
                )
            }
        }

        internal fun parserCallback(): suspend RunScope.() -> Unit = {}

        internal fun pathCallback(): suspend RunScope.() -> Unit = {}

        internal fun applicableCallback(): suspend RunScope.() -> Unit = {}

        internal fun runCallback(): suspend RunScope.() -> Unit = {}

        internal fun mergeCallback(): suspend RunScope.() -> Unit = {}

        internal fun jsonCallback(): suspend RunScope.() -> Unit = {}
    }
}
