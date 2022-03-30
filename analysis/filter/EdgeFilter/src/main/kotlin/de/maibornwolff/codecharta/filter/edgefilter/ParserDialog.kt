package de.maibornwolff.codecharta.filter.edgefilter

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptInput
import de.maibornwolff.codecharta.tools.interactivecli.ParserDialogInterface
import picocli.CommandLine

class ParserDialog {
    companion object : ParserDialogInterface {
        private const val EXTENSION = "cc.json"
        override fun generateDialog(args: Array<String>, commandLine: CommandLine): Int {
            if (args.isEmpty() || args[0] == "-h" || args[0] == "--help") {
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
                // TODO
                /* val hasCustomPathSeparator: Boolean = KInquirer.promptConfirm(message = "Do you want to use a different path separator than '/'?", default = false)

                var pathSeparator = '/'

                if (hasCustomPathSeparator) {
                    println("Please type in a new path separator.")
                    pathSeparator = readLine()!![0]
                } */

                val selectedArgs = arrayOf(inputFileName, "-o $outputFileName")
                return commandLine.execute(*selectedArgs)
            }
            return commandLine.execute(*args)
        }

        override fun isValidFileName(fileName: String): Boolean {
            return checkExtension(fileName, EXTENSION)
        }
    }
}
