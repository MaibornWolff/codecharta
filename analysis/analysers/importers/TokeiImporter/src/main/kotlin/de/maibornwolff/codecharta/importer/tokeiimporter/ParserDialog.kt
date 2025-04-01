package de.maibornwolff.codecharta.analysis.importer.tokeiimporter

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.analysers.analyserinterface.ParserDialogInterface
import de.maibornwolff.codecharta.analysers.tools.inquirer.InputType
import de.maibornwolff.codecharta.analysers.tools.inquirer.myPromptConfirm
import de.maibornwolff.codecharta.analysers.tools.inquirer.myPromptDefaultFileFolderInput
import de.maibornwolff.codecharta.analysers.tools.inquirer.myPromptInput
import de.maibornwolff.codecharta.serialization.FileExtension

class ParserDialog {
    companion object : ParserDialogInterface {
        override fun collectParserArgs(session: Session): List<String> {
            val inputFileName: String = session.myPromptDefaultFileFolderInput(
                InputType.FILE,
                listOf(FileExtension.JSON),
                onInputReady = testCallback()
            )

            val outputFileName: String = session.myPromptInput(
                message = "What is the name of the output file?",
                hint = "output.cc.json",
                allowEmptyInput = true,
                onInputReady = testCallback()
            )

            val rootName = session.myPromptInput(
                message = "Which root folder was specified when executing tokei?",
                hint = ".",
                allowEmptyInput = false,
                onInputReady = testCallback()
            )

            var pathSeparator = session.myPromptInput(
                message = "Which path separator is used? Leave empty for auto-detection",
                hint = "",
                allowEmptyInput = true,
                onInputReady = testCallback()
            )

            if (pathSeparator == "\\") pathSeparator = "\\\\"

            val isCompressed = (outputFileName.isEmpty()) || session.myPromptConfirm(
                message = "Do you want to compress the output file?",
                onInputReady = testCallback()
            )

            return listOfNotNull(
                inputFileName,
                "--output-file=$outputFileName",
                "--root-name=$rootName",
                "--path-separator=$pathSeparator",
                if (isCompressed) null else "--not-compressed"
            )
        }

        internal fun testCallback(): suspend RunScope.() -> Unit = {}
    }
}
