package de.maibornwolff.codecharta.ccsh.analyser

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.dialogProvider.InputType
import de.maibornwolff.codecharta.dialogProvider.InputValidator
import de.maibornwolff.codecharta.dialogProvider.promptCheckbox
import de.maibornwolff.codecharta.dialogProvider.promptConfirm
import de.maibornwolff.codecharta.dialogProvider.promptInput
import de.maibornwolff.codecharta.dialogProvider.promptList
import java.nio.file.Paths

class InteractiveDialog {
    companion object {
        internal fun askAnalyserToExecute(session: Session, analyserOptions: List<String>): String {
            return session.promptList(
                message = "Which analyser do you want to execute?",
                choices = analyserOptions,
                onInputReady = testCallback()
            )
        }

        internal fun askForPath(session: Session): String {
            println("You can provide a directory path / file path / sonar url.")
            return session.promptInput(
                message = "Which path should be scanned?",
                hint = Paths.get("").toAbsolutePath().toString(),
                allowEmptyInput = false,
                onInputReady = testCallback()
            )
        }

        internal fun askApplicableAnalyser(session: Session, applicableAnalysers: List<String>): List<String> {
            return session.promptCheckbox(
                message = "Choose from this list of applicable analysers. You can select individual analysers by pressing spacebar.",
                choices = applicableAnalysers,
                allowEmptyInput = true,
                onInputReady = testCallback()
            )
        }

        internal fun askRunAnalysers(session: Session): Boolean {
            return session.promptConfirm(
                message = "Do you want to run all configured analysers now?",
                onInputReady = testCallback()
            )
        }

        internal fun askForMerge(session: Session): Boolean {
            return session.promptConfirm(
                message = "Do you want to merge all generated files into one result now?",
                onInputReady = testCallback()
            )
        }

        internal fun askJsonPath(session: Session): String {
            println(
                "If you did not output all cc.json files into the same folder, " +
                    "you need to manually move them there before trying to merge."
            )
            return session.promptInput(
                message = "What is the folder path containing all cc.json files?",
                hint = Paths.get("").toAbsolutePath().toString(),
                inputValidator = InputValidator.isFileOrFolderValid(
                    InputType.FOLDER,
                    listOf()
                ),
                onInputReady = testCallback()
            )
        }

        internal fun testCallback(): suspend RunScope.() -> Unit = {}
    }
}
