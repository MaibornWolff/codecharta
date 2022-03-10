package de.maibornwolff.codecharta.filter.edgefilter

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import picocli.CommandLine

class UserDialog {
    companion object {
        fun generateDialog(args: Array<String>, commandLine: CommandLine): Int {
            if (args.isEmpty() || args[0] == "-h" || args[0] == "--help") {
                println("Please type in the json file that has to be converted.")
                var input = readln()
                var checkedFile = checkFileForCorrectness(input)
                var outputName = getOutputFileName(checkedFile)

                val isDefaultName: Boolean = KInquirer.promptConfirm(message = "Do you want to use '$outputName' as name for the output file?", default = true)

                if (!isDefaultName) {
                    println("Please type in the name for the output file.")
                    outputName = readln()
                }

                // TODO
                /* val hasCustomPathSeparator: Boolean = KInquirer.promptConfirm(message = "Do you want to use a different path separator than '/'?", default = false)

                var pathSeparator = '/'

                if (hasCustomPathSeparator) {
                    println("Please type in a new path separator.")
                    pathSeparator = readLine()!![0]
                } */

                val selectedArgs = arrayOf(checkedFile, "-o $outputName")
                return commandLine.execute(*selectedArgs)
            }
            return commandLine.execute(*args)
        }

        private fun checkFileForCorrectness(inputFile: String): String {
            var fileName = inputFile

            while (!isJSON(fileName)) {
                println("The file doesn't have a json extension. Enter a new file name.")
                fileName = readln()
            }

            return fileName
        }

        private fun isJSON(file: String): Boolean {
            var fileExtension = file.substringAfterLast(".")
            return fileExtension == "json"
        }

        private fun getOutputFileName(file: String): String {
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
