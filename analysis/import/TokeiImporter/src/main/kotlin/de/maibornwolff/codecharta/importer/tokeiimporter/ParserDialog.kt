package de.maibornwolff.codecharta.importer.tokeiimporter

import com.varabyte.kotter.foundation.session
import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.serialization.FileExtension
import de.maibornwolff.codecharta.tools.inquirer.InputType
import de.maibornwolff.codecharta.tools.inquirer.myPromptConfirm
import de.maibornwolff.codecharta.tools.inquirer.myPromptDefaultFileFolderInput
import de.maibornwolff.codecharta.tools.inquirer.myPromptInput
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface

class ParserDialog {
    companion object : ParserDialogInterface {
        override fun collectParserArgs(): List<String> {
            var res = listOf<String>()
            session { res = myCollectParserArgs() }
            return res
        }

        internal fun Session.myCollectParserArgs(
            fileCallback: suspend RunScope.() -> Unit = {},
            outFileCallback: suspend RunScope.() -> Unit = {},
            rootCallback: suspend RunScope.() -> Unit = {},
            pathCallback: suspend RunScope.() -> Unit = {},
            compressCallback: suspend RunScope.() -> Unit = {}
        ): List<String> {
            val inputFileName: String = myPromptDefaultFileFolderInput(
                InputType.FILE,
                listOf(FileExtension.JSON),
                onInputReady = fileCallback
            )

            val outputFileName: String = myPromptInput(
                message = "What is the name of the output file?",
                hint = "output.cc.json",
                allowEmptyInput = true,
                onInputReady = outFileCallback
            )

            val rootName = myPromptInput(
                message = "Which root folder was specified when executing tokei?",
                hint = ".",
                allowEmptyInput = false,
                onInputReady = rootCallback
            )

            var pathSeparator = myPromptInput(
                message = "Which path separator is used? Leave empty for auto-detection",
                hint = "",
                allowEmptyInput = true,
                onInputReady = pathCallback
            )

            if (pathSeparator == "\\") pathSeparator = "\\\\"

            val isCompressed = (outputFileName.isEmpty()) || myPromptConfirm(
                message = "Do you want to compress the output file?",
                onInputReady = compressCallback
            )

            return listOfNotNull(
                inputFileName,
                "--output-file=$outputFileName",
                "--root-name=$rootName",
                "--path-separator=$pathSeparator",
                if (isCompressed) null else "--not-compressed"
            )
        }
    }
}
