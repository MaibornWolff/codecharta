package de.maibornwolff.codecharta.tools.ccsh.parser

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.tools.inquirer.InputType
import de.maibornwolff.codecharta.tools.inquirer.myPromptCheckbox
import de.maibornwolff.codecharta.tools.inquirer.myPromptConfirm
import de.maibornwolff.codecharta.tools.inquirer.myPromptInput
import de.maibornwolff.codecharta.tools.inquirer.myPromptList
import de.maibornwolff.codecharta.tools.inquirer.util.InputValidator
import java.nio.file.Paths

class InteractiveDialog {
    companion object {
        internal fun askParserToExecute(session: Session, parserOptions: List<String>): String {
            return session.myPromptList(
                message = "Which parser do you want to execute?",
                choices = parserOptions,
                onInputReady = parserCallback()
            )
        }

        internal fun askForPath(session: Session): String {
            println("You can provide a directory path / file path / sonar url.")
            return session.myPromptInput(
                message = "Which path should be scanned?",
                hint = Paths.get("").toAbsolutePath().toString(),
                allowEmptyInput = false,
                onInputReady = pathCallback()
            )
        }

        internal fun askApplicableParser(session: Session, applicableParsers: List<String>): List<String> {
            return session.myPromptCheckbox(
                message = "Choose from this list of applicable parsers. You can select individual parsers by pressing spacebar.",
                choices = applicableParsers,
                allowEmptyInput = true,
                onInputReady = applicableCallback()
            )
        }

        internal fun askRunParsers(session: Session): Boolean {
            return session.myPromptConfirm(
                message = "Do you want to run all configured parsers now?",
                onInputReady = runCallback()
            )
        }

        internal fun askForMerge(session: Session): Boolean {
            return session.myPromptConfirm(
                message = "Do you want to merge all generated files into one result now?",
                onInputReady = mergeCallback()
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
                onInputReady = jsonCallback()
            )
        }

        internal fun parserCallback(): suspend RunScope.() -> Unit = {}

        internal fun pathCallback(): suspend RunScope.() -> Unit = {}

        internal fun applicableCallback(): suspend RunScope.() -> Unit = {}

        internal fun runCallback(): suspend RunScope.() -> Unit = {}

        internal fun mergeCallback(): suspend RunScope.() -> Unit = {}

        internal fun jsonCallback(): suspend RunScope.() -> Unit = {}
    }
}
