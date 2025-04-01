package de.maibornwolff.codecharta.analysers.tools.ccsh.parser.repository

import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import picocli.CommandLine

class PicocliParserRepository : ParserRepository<CommandLine> {
    override fun getAnalyserInterfaceNames(dataSource: CommandLine): List<String> {
        val subCommands = dataSource.subcommands.values
        return subCommands.mapNotNull { subCommand ->
            val parserName = subCommand.commandName
            if (subCommand.commandSpec.userObject() is AnalyserInterface) {
                parserName
            } else {
                null
            }
        }
    }

    override fun getAnalyserInterfaceNamesWithDescription(dataSource: CommandLine): List<String> {
        val subCommands = dataSource.subcommands.values
        return subCommands.mapNotNull { subCommand ->
            val parserName = subCommand.commandName
            val parser = subCommand.commandSpec.userObject()
            if (parser is AnalyserInterface) {
                val parserDescriptions = subCommand.commandSpec.usageMessage().description()
                val parserDescription = parserDescriptions[0]
                "$parserName - $parserDescription"
            } else {
                null
            }
        }
    }

    override fun extractParserName(parserNameWithDescription: String): String {
        return parserNameWithDescription.substringBefore(' ')
    }

    override fun getApplicableParsers(inputFile: String, allParsers: List<AnalyserInterface>): List<AnalyserInterface> {
        val usableParsers = mutableListOf<AnalyserInterface>()

        for (parser in allParsers) {
            if (parser.isApplicable(inputFile)) {
                usableParsers.add(parser)
            }
        }

        return usableParsers
    }

    override fun getAllAnalyserInterfaces(dataSource: CommandLine): List<AnalyserInterface> {
        val allParserNames = getAnalyserInterfaceNames(dataSource)
        val allParsers = mutableListOf<AnalyserInterface>()
        for (parserName in allParserNames) {
            val interactive = getAnalyserInterface(dataSource, parserName)

            if (interactive != null) {
                allParsers.add(interactive)
            }
        }
        return allParsers
    }

    override fun getApplicableAnalyserInterfaceNamesWithDescription(inputFile: String, allParsers: List<AnalyserInterface>): List<String> {
        val applicableParsers = getApplicableParsers(inputFile, allParsers)
        val result = mutableListOf<String>()
        for (parser in applicableParsers) {
            val nameAndDescription = parser.getParserName() + " - " + parser.getParserDescription()
            result.add(nameAndDescription)
        }
        return result
    }

    override fun getAnalyserInterface(dataSource: CommandLine, name: String): AnalyserInterface? {
        return try {
            val subCommand = dataSource.subcommands.getValue(name)
            val parserObject = subCommand.commandSpec.userObject()
            parserObject as? AnalyserInterface
        } catch (exception: NoSuchElementException) {
            println("Could not find the specified parser with the name '$name'!")
            null
        }
    }
}
