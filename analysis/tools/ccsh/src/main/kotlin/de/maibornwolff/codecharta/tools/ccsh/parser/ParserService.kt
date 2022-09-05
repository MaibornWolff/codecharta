package de.maibornwolff.codecharta.tools.ccsh.parser

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptList
import de.maibornwolff.codecharta.tools.interactiveparser.InteractiveParser
import picocli.CommandLine

class ParserService {
    companion object {
        private const val EXIT_CODE_PARSER_NOT_SUPPORTED = 42

        fun selectParser(commandLine: CommandLine): String {
            val selectedParser: String = KInquirer.promptList(
                message = "Which parser do you want to execute?",
                choices = getParserNamesWithDescription(commandLine)
            )

            return extractParserName(selectedParser)
        }

        fun executeSelectedParser(commandLine: CommandLine, selectedParser: String): Int {
            val subCommand = commandLine.subcommands.getValue(selectedParser)
            val parserObject = subCommand.commandSpec.userObject()
            val interactive = parserObject as? InteractiveParser
            if (interactive != null) {
                val collectedArgs = interactive.getDialog().collectParserArgs()
                val subCommandLine = CommandLine(interactive)
                println("You can run the same command again by using the following command line arguments:")
                println("ccsh " + selectedParser + " " + collectedArgs.map { x -> '"' + x + '"' }.joinToString(" "))
                return subCommandLine.execute(*collectedArgs.toTypedArray())
            } else {
                printNotSupported(selectedParser)
                return EXIT_CODE_PARSER_NOT_SUPPORTED
            }
        }

        private fun getParserNamesWithDescription(commandLine: CommandLine): List<String> {
            val subCommands = commandLine.subcommands.values
            return subCommands.mapNotNull { subCommand ->
                val parserName = subCommand.commandName
                if (subCommand.commandSpec.userObject() is InteractiveParser) {
                    val parserDescriptions = subCommand.commandSpec.usageMessage().description()
                    val parserDescription = parserDescriptions[0]
                    "$parserName - $parserDescription"
                } else null
            }
        }

        private fun extractParserName(parserNameWithDescription: String): String {
            return parserNameWithDescription.substringBefore(' ')
        }

        private fun printNotSupported(parserName: String) {
            println(
                "The interactive usage of $parserName is not supported yet.\n" +
                        "Please specify the full command to run the parser."
            )
        }
    }
}
