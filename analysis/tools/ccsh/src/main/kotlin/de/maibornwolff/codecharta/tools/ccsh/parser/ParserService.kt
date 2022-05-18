package de.maibornwolff.codecharta.tools.ccsh.parser

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptList
import de.maibornwolff.codecharta.filter.edgefilter.EdgeFilter
import de.maibornwolff.codecharta.importer.gitlogparser.GitLogParser
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
                "check" -> printNotSupported(selectedParser)
                "merge" -> printNotSupported(selectedParser)
                "edgefilter" -> EdgeFilter.main(args)
                "modify" -> printNotSupported(selectedParser)
                "csvimport" -> printNotSupported(selectedParser)
                "sonarimport" -> printNotSupported(selectedParser)
                "sourcemonitorimport" -> printNotSupported(selectedParser)
                "gitlogparser" -> GitLogParser.main(args)
                "svnlogparser" -> printNotSupported(selectedParser)
                "csvexport" -> printNotSupported(selectedParser)
                "sourcecodeparser" -> printNotSupported(selectedParser)
                "codemaatimport" -> printNotSupported(selectedParser)
                "tokeiimporter" -> printNotSupported(selectedParser)
                "rawtextparser" -> printNotSupported(selectedParser)
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

        private fun printNotSupported(parserName: String) {
            println("The interactive usage of $parserName is not supported yet.\n" +
                    "Please specify the full command to run the parser.")
        }
    }
}
