package de.maibornwolff.codecharta.tools.validation

import picocli.CommandLine

class UserDialog {
    companion object {
        fun generateDialog(args: Array<String>, commandLine: CommandLine): Int {
            if (args.isEmpty() || args[0] == "-h" || args[0] == "--help") {
                println("Please type in the cc.json file that has to be validated.")
                var input = readln()
                val selectedArgs = arrayOf(checkFileForCorrectness(input))
                return commandLine.execute(*selectedArgs)
            }
            return commandLine.execute(*args)
        }

        private fun checkFileForCorrectness(inputFile: String): String {
            var fileName = inputFile

            while (!isJSON(fileName) || !fileName.contains(".cc.")) {
                println("The file doesn't have a json extension or the cc.json schema. Enter a new file name.")
                fileName = readln()
            }

            return fileName
        }

        private fun isJSON(file: String): Boolean {
            var fileExtension = file.substringAfter(".cc.")
            return fileExtension == "json"
        }
    }
}
