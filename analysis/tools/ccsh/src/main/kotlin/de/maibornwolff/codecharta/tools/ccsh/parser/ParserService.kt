package de.maibornwolff.codecharta.tools.ccsh.parser

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptList
import de.maibornwolff.codecharta.filter.edgefilter.EdgeFilter
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
                "check" -> print("Not implemented yet")
                "merge" -> print("Not implemented yet")
                "edgefilter" -> EdgeFilter.main(args)
                "modify" -> print("Not implemented yet")
                "csvimport" -> print("Not implemented yet")
                "sonarimport" -> print("Not implemented yet")
                "sourcemonitorimport" -> print("Not implemented yet")
                "gitlogparser" -> print("Not implemented yet")
                "svnlogparser" -> print("Not implemented yet")
                "csvexport" -> print("Not implemented yet")
                "sourcecodeparser" -> print("Not implemented yet")
                "codemaatimport" -> print("Not implemented yet")
                "tokeiimporter" -> print("Not implemented yet")
                "rawtextparser" -> print("Not implemented yet")
                else -> {
                    println("No valid parser was selected.")
                }
            }
        }

        private fun getParserNamesWithDescription(commandLine: CommandLine): List<String> {
            val subCommands = commandLine.subcommands.values
            return subCommands.map { subCommand ->
                val parserName = subCommand.commandName
                val parserDescriptions = subCommand.commandSpec.usageMessage().description()
                val parserDescription = parserDescriptions[0]
                "$parserName - $parserDescription"
            }
        }

        private fun extractParserName(parserNameWithDescription: String): String {
            return parserNameWithDescription.substringBefore(' ')
        }
    }
}
