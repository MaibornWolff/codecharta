package de.maibornwolff.codecharta.exporter.csv

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import picocli.CommandLine

class UserDialog {
    companion object {
        fun generateDialog(args: Array<String>, commandLine: CommandLine): Int {
            if (args.isEmpty() || args[0] == "-h" || args[0] == "--help") {
                println("Please type in the cc.json file that has to be converted.")
                var input = readln()
                var checkedFile = checkFileForCorrectness(input)
                // var inputFiles = getUserFiles(checkedFile)

                var outputName = getOutputFileName(checkedFile)

                val isDefaultName: Boolean = KInquirer.promptConfirm(message = "Do you want to use '$outputName' as name for the output file?", default = true)

                if (!isDefaultName) {
                    println("Please type in the name for the output file.")
                    outputName = readln()
                }

                println("Please type in the number for the depth of the hierarchy. Note that 10 is the maximum.")
                val inputMaxHierarchy = readln()
                val maxHierarchy = checkNumberForCorrectness(inputMaxHierarchy)

                val selectedArgs = arrayOf(checkedFile, "-o $outputName", "--depth-of-hierarchy $maxHierarchy")

                return commandLine.execute(*selectedArgs)
            }
            return commandLine.execute(*args)
        }

        private fun getUserFiles(checkedFile: String): Array<String> {
            return checkedFile.split(" ").toTypedArray()
        }

        private fun checkFileForCorrectness(inputFile: String): String {
            var fileName = inputFile

            while (!isJSON(fileName)) {
                println("The file doesn't have a json extension. Enter a new file name.")
                fileName = readln()
            }

            return fileName
        }

        private fun checkNumberForCorrectness(number: String): Int {
            var number = number

            if (isNumberInRange(number)) {
                return number.toInt()
            } else {
                while (!isNumberInRange(number)) {
                    println("Please type in a number in the range of 0 to 10.")
                    number = readln()
                }
                return number.toInt()
            }
        }

        private fun isNumberInRange(input: String): Boolean {
            val regex = "([0-9]|10)".toRegex()
            return input.matches(regex)
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
