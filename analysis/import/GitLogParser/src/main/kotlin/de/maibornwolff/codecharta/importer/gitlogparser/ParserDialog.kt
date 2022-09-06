package de.maibornwolff.codecharta.importer.gitlogparser

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import com.github.kinquirer.components.promptInput
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface

class ParserDialog {
    companion object : ParserDialogInterface {
        private const val EXTENSION = "log"

        override fun collectParserArgs(): List<String> {
            print("You can generate this file with: git log --numstat --raw --topo-order --reverse -m > git.log")
            val defaultInputFileName = "git.$EXTENSION"
            val inputFileName = KInquirer.promptInput(
                message = "What is the $EXTENSION file that has to be parsed?",
                hint = defaultInputFileName,
                default = defaultInputFileName
            )

            val defaultOutputFileName = getOutputFileName(inputFileName)
            val outputFileName: String = KInquirer.promptInput(
                message = "What is the name of the output file?",
                hint = defaultOutputFileName,
                default = defaultOutputFileName
            )

            print("You can generate this file with: git ls-files > file-name-list.txt")
            val defaultFileNameList = "file-name-list.txt"
            val fileNameList = KInquirer.promptInput(
                message = "What is the path to the file name list?",
                hint = defaultFileNameList,
                default = defaultFileNameList
            )

            val isCompressed = (outputFileName.isEmpty()) || KInquirer.promptConfirm(
                message = "Do you want to compress the output file?",
                default = true
            )

            val isSilent: Boolean =
                KInquirer.promptConfirm(message = "Do you want to suppress command line output?", default = false)

            val addAuthor: Boolean =
                KInquirer.promptConfirm(message = "Do you want to add authors to every file?", default = false)

            return listOfNotNull(
                inputFileName,
                "--output-file=$outputFileName",
                "--file-name-list=$fileNameList",
                if (isCompressed) null else "--not-compressed",
                "--silent=$isSilent",
                "--add-author=$addAuthor"
            )
        }
    }
}
