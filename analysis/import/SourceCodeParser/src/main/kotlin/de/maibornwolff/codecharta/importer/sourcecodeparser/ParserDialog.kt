package de.maibornwolff.codecharta.importer.sourcecodeparser

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import com.github.kinquirer.components.promptInput
import com.github.kinquirer.components.promptListObject
import com.github.kinquirer.core.Choice
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import de.maibornwolff.codecharta.util.InputHelper
import java.io.File

class ParserDialog {
    companion object : ParserDialogInterface {
    override fun collectParserArgs(): List<String> {
            var inputFileName: String
            do {
                inputFileName = getInputFileName("Which project folder or code file should be parsed?", "")
            } while (!InputHelper.isInputValidAndNotNull(arrayOf(File(inputFileName)), canInputContainFolders = true))

            val outputFormat =
                    KInquirer.promptListObject(
                            message = "Which output format should be generated?",
                            choices =
                            listOf(
                                    Choice("CodeCharta JSON", OutputFormat.JSON),
                                    Choice("CSV", OutputFormat.CSV),
                                  ),
                                              )

            val defaultOutputFilename = if (outputFormat == OutputFormat.JSON) "output.cc.json" else "output.csv"
            val outputFileName: String =
                    KInquirer.promptInput(
                            message = "What is the name of the output file?",
                            hint = defaultOutputFilename,
                            default = defaultOutputFilename,
                                         )

            val findIssues =
                    KInquirer.promptConfirm(
                            message = "Should we search for sonar issues?",
                            default = true,
                                           )

            val defaultExcludes =
                    KInquirer.promptConfirm(
                            message = "Should we apply default excludes (build, target, dist and out folders, hidden files/folders)?",
                            default = false,
                                           )

            val exclude = mutableListOf<String>()
            while (true) {
                val additionalExclude =
                        KInquirer.promptInput(
                                message = "Exclude file/folder according to regex pattern? Leave empty to skip.",
                                             )
                if (additionalExclude.isNotBlank()) {
                    exclude.add("--exclude=$additionalExclude")
                } else {
                    break
                }
            }

            val isCompressed =
                    (outputFileName.isEmpty()) ||
                    KInquirer.promptConfirm(
                            message = "Do you want to compress the output file?",
                            default = true,
                                           )

            val isVerbose: Boolean =
                    KInquirer.promptConfirm(message = "Display info messages from sonar plugins?", default = false)

            return listOfNotNull(
                    inputFileName,
                    "--format=$outputFormat",
                    "--output-file=$outputFileName",
                    if (isCompressed) null else "--not-compressed",
                    if (findIssues) null else "--no-issues",
                    if (defaultExcludes) "--default-excludes" else null,
                    if (isVerbose) "--verbose" else null,
                                ) + exclude
        }
    }
}
