package de.maibornwolff.codecharta.tools.ccsh.parser.repository

import de.maibornwolff.codecharta.tools.interactiveparser.InteractiveParser
import picocli.CommandLine

class PicocliParserRepository : IParserRepository<CommandLine> {

    override fun getParserNames(dataSource: CommandLine): List<String> {
        val subCommands = dataSource.subcommands.values
        return subCommands.mapNotNull { subCommand ->
            val parserName = subCommand.commandName
            if(subCommand.commandSpec.userObject() is InteractiveParser){
                parserName
            }else null
        }
    }

    override fun getParserNamesWithDescription(dataSource: CommandLine): List<String> {
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

    override fun extractParserName(parserNameWithDescription: String) : String {
        return parserNameWithDescription.substringBefore(' ')
    }

    override fun getAllParsers(dataSource: CommandLine): List<InteractiveParser> {
        val allParserNames = getParserNames(dataSource)
        val allParsers = mutableListOf<InteractiveParser>()
        for(parserName in allParserNames){
            val interactive = getParser(dataSource, parserName)

            if(interactive != null){
                allParsers.add(interactive)
            }
        }
        return allParsers
    }

    override fun getUsableParserNames(inputFile: String, allParsers: List<InteractiveParser>): List<String> {
        val usableParsers = mutableListOf<String>()

        for(parser in allParsers){
            if(parser.isUsable(inputFile)){
                usableParsers.add(parser.getName())
            }
        }
        return usableParsers
    }

    override fun getParser(dataSource: CommandLine, name: String): InteractiveParser? {
        val subCommand = dataSource.subcommands.getValue(name)
        val parserObject = subCommand.commandSpec.userObject()

        return parserObject as? InteractiveParser
    }
}
