package de.maibornwolff.codecharta.tools.ccsh.parser.repository

import de.maibornwolff.codecharta.tools.interactiveparser.InteractiveParser
import picocli.CommandLine

class PicocliParserRepository : ParserRepository<CommandLine> {

    override fun getInteractiveParserNames(dataSource: CommandLine): List<String> {
        val subCommands = dataSource.subcommands.values
        return subCommands.mapNotNull { subCommand ->
            val parserName = subCommand.commandName
            if (subCommand.commandSpec.userObject() is InteractiveParser) {
                parserName
            } else null
        }
    }

    override fun getInteractiveParserNamesWithDescription(dataSource: CommandLine): List<String> {
        val subCommands = dataSource.subcommands.values
        return subCommands.mapNotNull { subCommand ->
            val parserName = subCommand.commandName
            if (subCommand.commandSpec.userObject() is InteractiveParser) {
                val parserDescriptions = subCommand.commandSpec.usageMessage().description()
                val parserDescription = parserDescriptions[0]
                "$parserName - $parserDescription"
            } else null
        }
    }

    override fun extractParserName(parserNameWithDescription: String): String {
        return parserNameWithDescription.substringBefore(' ')
    }

    override fun getAllInteractiveParsers(dataSource: CommandLine): List<InteractiveParser> {
        val allParserNames = getInteractiveParserNames(dataSource)
        val allParsers = mutableListOf<InteractiveParser>()
        for (parserName in allParserNames) {
            val interactive = getInteractiveParser(dataSource, parserName)

            if (interactive != null) {
                allParsers.add(interactive)
            }
        }
        return allParsers
    }

    override fun getApplicableInteractiveParserNames(inputFile: String, allParsers: List<InteractiveParser>): List<String> {
        val usableParsers = mutableListOf<String>()

        for (parser in allParsers) {
            if (parser.isApplicable(inputFile)) {
                usableParsers.add(parser.getName())
            }
        }
        return usableParsers
    }

    override fun getInteractiveParser(dataSource: CommandLine, name: String): InteractiveParser? {
        return try {
            val subCommand = dataSource.subcommands.getValue(name)
            val parserObject = subCommand.commandSpec.userObject()
            parserObject as? InteractiveParser
        } catch (exception: NoSuchElementException) {
            println("Could not find the specified parser with the name '$name'!")
            null
        }
    }
}
