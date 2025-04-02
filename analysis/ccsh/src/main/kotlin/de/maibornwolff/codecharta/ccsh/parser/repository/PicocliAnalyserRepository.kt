package de.maibornwolff.codecharta.ccsh.parser.repository

import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import picocli.CommandLine

class PicocliAnalyserRepository : AnalyserRepository<CommandLine> {
    override fun getAnalyserInterfaceNames(dataSource: CommandLine): List<String> {
        val subCommands = dataSource.subcommands.values
        return subCommands.mapNotNull { subCommand ->
            val analyserName = subCommand.commandName
            if (subCommand.commandSpec.userObject() is AnalyserInterface) {
                analyserName
            } else {
                null
            }
        }
    }

    override fun getAnalyserInterfaceNamesWithDescription(dataSource: CommandLine): List<String> {
        val subCommands = dataSource.subcommands.values
        return subCommands.mapNotNull { subCommand ->
            val analyserName = subCommand.commandName
            val analyser = subCommand.commandSpec.userObject()
            if (analyser is AnalyserInterface) {
                val analyserDescriptions = subCommand.commandSpec.usageMessage().description()
                val analyserDescription = analyserDescriptions[0]
                "$analyserName - $analyserDescription"
            } else {
                null
            }
        }
    }

    override fun extractAnalyserName(analyserNameWithDescription: String): String {
        return analyserNameWithDescription.substringBefore(' ')
    }

    override fun getApplicableAnalysers(inputFile: String, allAnalysers: List<AnalyserInterface>): List<AnalyserInterface> {
        val usableAnalysers = mutableListOf<AnalyserInterface>()

        for (analyser in allAnalysers) {
            if (analyser.isApplicable(inputFile)) {
                usableAnalysers.add(analyser)
            }
        }

        return usableAnalysers
    }

    override fun getAllAnalyserInterfaces(dataSource: CommandLine): List<AnalyserInterface> {
        val allAnalyserNames = getAnalyserInterfaceNames(dataSource)
        val allAnalysers = mutableListOf<AnalyserInterface>()
        for (analyserName in allAnalyserNames) {
            val interactive = getAnalyserInterface(dataSource, analyserName)

            if (interactive != null) {
                allAnalysers.add(interactive)
            }
        }
        return allAnalysers
    }

    override fun getApplicableAnalyserNamesWithDescription(inputFile: String, allAnalysers: List<AnalyserInterface>): List<String> {
        val applicableAnalysers = getApplicableAnalysers(inputFile, allAnalysers)
        val result = mutableListOf<String>()
        for (analyser in applicableAnalysers) {
            val nameAndDescription = analyser.getAnalyserName() + " - " + analyser.getAnalyserDescription()
            result.add(nameAndDescription)
        }
        return result
    }

    override fun getAnalyserInterface(dataSource: CommandLine, name: String): AnalyserInterface? {
        return try {
            val subCommand = dataSource.subcommands.getValue(name)
            val analyserObject = subCommand.commandSpec.userObject()
            analyserObject as? AnalyserInterface
        } catch (exception: NoSuchElementException) {
            println("Could not find the specified analyser with the name '$name'!")
            null
        }
    }
}
