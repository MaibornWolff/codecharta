package de.maibornwolff.codecharta.tools.ccsh.parser

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.tools.inquirer.InputType
import de.maibornwolff.codecharta.tools.inquirer.InputValidator
import de.maibornwolff.codecharta.tools.inquirer.myPromptCheckbox
import de.maibornwolff.codecharta.tools.inquirer.myPromptConfirm
import de.maibornwolff.codecharta.tools.inquirer.myPromptInput
import de.maibornwolff.codecharta.tools.inquirer.myPromptList
import java.nio.file.Paths

class InteractiveDialog {
    companion object {
        internal fun askParserToExecute(session: Session, parserOptions: List<String>): String {
            return session.myPromptList(
                message = "Which parser do you want to execute?",
                choices = parserOptions,
                onInputReady = testCallback()
            )
        }

        internal fun askForPath(session: Session): String {
            println("You can provide a directory path / file path / sonar url.")
            return session.myPromptInput(
                message = "Which path should be scanned?",
                hint = Paths.get("").toAbsolutePath().toString(),
                allowEmptyInput = false,
                onInputReady = testCallback()
            )
        }

        internal fun askApplicableParser(session: Session, applicableParsers: List<String>): List<String> {
            return session.myPromptCheckbox(
                message = "Choose from this list of applicable parsers. You can select individual parsers by pressing spacebar.",
                choices = applicableParsers,
                allowEmptyInput = true,
                onInputReady = testCallback()
            )
        }

        internal fun askRunParsers(session: Session): Boolean {
            return session.myPromptConfirm(
                message = "Do you want to run all configured parsers now?",
                onInputReady = testCallback()
            )
        }

        internal fun askForMerge(session: Session): Boolean {
            return session.myPromptConfirm(
                message = "Do you want to merge all generated files into one result now?",
                onInputReady = testCallback()
            )
        }

        internal fun askJsonPath(session: Session): String {
            println(
                "If you did not output all cc.json files into the same folder, " +
                    "you need to manually move them there before trying to merge."
            )
            return session.myPromptInput(
                message = "What is the folder path containing all cc.json files?",
                hint = Paths.get("").toAbsolutePath().toString(),
                inputValidator = InputValidator.isFileOrFolderValid(InputType.FOLDER, listOf()),
                onInputReady = testCallback()
            )
        }

        internal fun testCallback(): suspend RunScope.() -> Unit = {}
    }
}
