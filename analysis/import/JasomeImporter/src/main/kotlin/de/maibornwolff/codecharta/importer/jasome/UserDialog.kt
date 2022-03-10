package de.maibornwolff.codecharta.importer.jasome

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import picocli.CommandLine

class UserDialog {
    companion object {
        fun generateDialog(args: Array<String>, commandLine: CommandLine): Int {
            if (args.isEmpty() || args[0] == "-h" || args[0] == "--help") {
                println("Please type in the xml file that has to be converted.")
                var input = readln()
                var checkedFile = checkFileForCorrectness(input)
                var outputName = getOutputFileName(checkedFile)

                val isDefaultName: Boolean = KInquirer.promptConfirm(message = "Do you want to use $outputName as name for the output file?", default = true)

                if (!isDefaultName) {
                    outputName = getCustomOutputFilename()
                }

                val selectedArgs = arrayOf(checkedFile, "-o $outputName")
                return commandLine.execute(*selectedArgs)
            }
            return commandLine.execute(*args)
        }

        private fun getCustomOutputFilename() : String {
            println("Please type in the name for the output file.")
            return readln()
        }

        private fun checkFileForCorrectness(inputFile: String): String {
            var fileName = inputFile

            while (!isXML(fileName)) {
                println("The file doesn't have a xml extension. Enter a new file name.")
                fileName = readln()
            }

            return fileName
        }

        private fun isXML(file: String): Boolean {
            var fileExtension = file.substringAfter(".")
            return fileExtension == "xml"
        }

        private fun getOutputFileName(file: String) : String {
            // val slashRegex = "[/\\\\]".toRegex()

            if (file.contains("/")) {
                return file.substringAfterLast("/").substringBeforeLast(".")
            }
            if (file.contains("\\")) {
                return file.substringAfterLast("\\").substringBeforeLast(".")
            }
            return file.substringBeforeLast(".")
        }
    }
}
