package de.maibornwolff.codecharta.analysers.importers.sbom

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.dialogProvider.InputType
import de.maibornwolff.codecharta.dialogProvider.promptConfirm
import de.maibornwolff.codecharta.dialogProvider.promptDefaultDirectoryAssistedInput
import de.maibornwolff.codecharta.dialogProvider.promptInput
import de.maibornwolff.codecharta.util.FileExtension

class Dialog {
    companion object : AnalyserDialogInterface {
        override fun collectAnalyserArgs(session: Session): List<String> {
            val sbomFile = session.promptDefaultDirectoryAssistedInput(
                InputType.FILE,
                listOf(FileExtension.JSON),
                onInputReady = testCallback()
            )
            val projectFolder = session.promptInput(
                message = "Which project folder was the SBOM made from?",
                hint = ".",
                allowEmptyInput = true,
                onInputReady = testCallback()
            )
            val isOsvAsked = session.promptConfirm(
                message = "Ask OSV.dev for vulnerabilities the SBOM does not carry? (sends package names and versions)",
                initialChoice = false,
                onInputReady = testCallback()
            )
            val isDepsDevAsked = session.promptConfirm(
                message = "Ask deps.dev for newer versions to measure the dependency lag? (sends package names)",
                initialChoice = false,
                onInputReady = testCallback()
            )
            val outputFileName = session.promptInput(
                message = "What is the name of the output file?",
                hint = "sbom.cc.json",
                allowEmptyInput = true,
                onInputReady = testCallback()
            )
            return listOfNotNull(
                sbomFile,
                projectFolder.takeIf { it.isNotEmpty() }?.let { "--project-folder=$it" },
                "--osv".takeIf { isOsvAsked },
                "--deps-dev".takeIf { isDepsDevAsked },
                outputFileName.takeIf { it.isNotEmpty() }?.let { "--output-file=$it" }
            )
        }

        internal fun testCallback(): suspend RunScope.() -> Unit = {}
    }
}
