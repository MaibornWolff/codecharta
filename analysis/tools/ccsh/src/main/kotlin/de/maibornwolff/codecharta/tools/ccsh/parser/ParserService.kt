package de.maibornwolff.codecharta.tools.ccsh.parser

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptList
import de.maibornwolff.codecharta.exporter.csv.CSVExporter
import de.maibornwolff.codecharta.filter.edgefilter.EdgeFilter
import de.maibornwolff.codecharta.tools.validation.ValidationTool
import picocli.CommandLine

class ParserService {
    companion object {
        fun selectParser(commandLine: CommandLine): String {
            val selectedParser: String = KInquirer.promptList(
                message = "Which parser do you want to execute?",
                choices = getParserNamesWithDescription(commandLine)
            )

            return extractParserName(selectedParser)
        }

        fun executeSelectedParser(selectedParser: String) {
            val args = emptyArray<String>()

            when (selectedParser) {
                "check" -> ValidationTool.main(args)
                "merge" -> print("Not implemented yet")
                "edgefilter" -> EdgeFilter.main(args)
                "modify" -> print("Not implemented yet")
                "csvimport" -> print("Not implemented yet")
                "sonarimport" -> print("Not implemented yet")
                "sourcemonitorimport" -> print("Not implemented yet")
                "scmlogparser" -> print("Not implemented yet")
                "scmlogparserv2" -> print("Not implemented yet")
                "csvexport" -> CSVExporter.main(args)
                "sourcecodeparser" -> print("Not implemented yet")
                "codemaatimport" -> print("Not implemented yet")
                "tokeiimporter" -> print("Not implemented yet")
                "rawtextparser" -> print("Not implemented yet")
                else -> {
                    println("No valid parser was selected.")
                }
            }
        }

        private fun getParserNamesWithDescription(commandLine: CommandLine): MutableList<String> {
            val subCommands = commandLine.subcommands.values
            val parsersList = mutableListOf<String>()

            for (subCommand in subCommands) {
                val parserName: String = subCommand.commandName
                val parserDescriptions = subCommand.commandSpec.usageMessage().description()
                val parserDescription = parserDescriptions[0]
                parsersList.add("$parserName - $parserDescription")
            }
            return parsersList
        }

        private fun extractParserName(parserNameWithDescription: String): String {
            return parserNameWithDescription.substring(0, parserNameWithDescription.indexOf(' '))
        }
    }
}
