package de.maibornwolff.codecharta.filter.edgefilter

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptInput
import de.maibornwolff.codecharta.tools.interactivecli.ParserDialogInterface
import picocli.CommandLine

class ParserDialog {
    companion object : ParserDialogInterface {
        private const val EXTENSION = "cc.json"
        override fun generateParserArgs(args: Array<String>, commandLine: CommandLine): Array<String> {

            var inputFileName = KInquirer.promptInput(message = "What is the $EXTENSION file that has to be parsed?")
            if (inputFileName.substringAfter(".") != EXTENSION)
                inputFileName += ".$EXTENSION"
            println("File path: $inputFileName")

            val defaultOutputFileName = getOutputFileName(inputFileName)
            val outputFileName: String = KInquirer.promptInput(
                message = "What is the name of the output file?",
                hint = defaultOutputFileName,
                default = defaultOutputFileName
            )

            val defaultPathSeparator = "/"
            val pathSeparator: String = KInquirer.promptInput(
                message = "What is the path separator?",
                hint = defaultPathSeparator,
                default = defaultPathSeparator
            )
            return arrayOf(inputFileName, "-o $outputFileName", "--path-separator=$pathSeparator")
        }

        override fun isValidFileName(fileName: String): Boolean {
            return checkExtension(fileName, EXTENSION)
        }
    }
}
