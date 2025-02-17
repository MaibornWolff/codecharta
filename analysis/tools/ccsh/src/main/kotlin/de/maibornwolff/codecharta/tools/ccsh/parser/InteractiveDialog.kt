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
        internal fun askParserToExecute(parserOptions: List<String>, parserCallback: suspend RunScope.() -> Unit = {}): String {
            return startSession {
                myPromptList(
                    message = "Which parser do you want to execute?",
                    choices = parserOptions,
                    onInputReady = parserCallback
                )
            }
        }

        internal fun askForPath(pathCallback: suspend RunScope.() -> Unit = {}): String {
            println("You can provide a directory path / file path / sonar url.")
            return startSession {
                myPromptInput(
                    message = "Which path should be scanned?",
                    hint = Paths.get("").toAbsolutePath().toString(),
                    allowEmptyInput = false,
                    onInputReady = pathCallback
                )
            }
        }

        internal fun askApplicableParser(
            applicableParsers: List<String>,
            applicableCallback: suspend RunScope.() -> Unit = {
            }
        ): List<String> {
            return startSession {
                myPromptCheckbox(
                    message = "Choose from this list of applicable parsers. You can select individual parsers by pressing spacebar.",
                    choices = applicableParsers,
                    allowEmptyInput = true,
                    onInputReady = applicableCallback
                )
            }
        }

        internal fun askRunParsers(runCallback: suspend RunScope.() -> Unit = {}): Boolean {
            return startSession {
                myPromptConfirm(
                    message = "Do you want to run all configured parsers now?",
                    onInputReady = runCallback
                )
            }
        }

        internal fun askForMerge(mergeCallback: suspend RunScope.() -> Unit = {}): Boolean {
            return startSession {
                myPromptConfirm(
                    message = "Do you want to merge all generated files into one result now?",
                    onInputReady = mergeCallback
                )
            }
        }

        internal fun askJsonPath(jsonCallback: suspend RunScope.() -> Unit = {}): String {
            println(
                "If you did not output all cc.json files into the same folder, " +
                    "you need to manually move them there before trying to merge."
            )
            return startSession {
                myPromptInput(
                    message = "What is the folder path containing all cc.json files?",
                    hint = Paths.get("").toAbsolutePath().toString(),
                    inputValidator = InputValidator.isFileOrFolderValid(InputType.FOLDER, listOf()),
                    onInputReady = jsonCallback
                )
            }
        }
    }
}
