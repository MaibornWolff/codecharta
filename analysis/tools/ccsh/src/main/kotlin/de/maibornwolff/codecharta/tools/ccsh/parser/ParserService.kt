package de.maibornwolff.codecharta.tools.ccsh.parser

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptList
import picocli.CommandLine

class ParserService {
    companion object {
        fun selectParser(commandLine: CommandLine): String {
            val chosenParser: String = KInquirer.promptList(message = "Which parser do you want to execute?", choices = getListOfParsers(commandLine))

            return chosenParser.substring(0, chosenParser.indexOf(' '))
        }

        fun getListOfParsers(commandLine: CommandLine): MutableList<String> {
            val subcommands = commandLine.subcommands.values
            val listOfParsers = mutableListOf<String>()
            var commandName: String

            for (command in subcommands) {
                commandName = command.commandName
                val commandDescription = command.commandSpec.usageMessage().description()

                for (description in commandDescription) {
                    listOfParsers.add("$commandName - $description")
                }
            }
            return listOfParsers
        }

        fun coordinateChosenParser(chosenParser: String) {
            when (chosenParser) {
                "check" -> Check.chooseInputFile()
                "merge" -> print("merge")
                "edgefilter" -> print("edgefilter")
                "modify" -> print("modify")
                "csvimport" -> print("csvimport")
                "sonarimport" -> print("sonarimport")
                "sourcemonitorimport" -> print("sourcemonitorimport")
                "scmlogparser" -> print("scmlogparser")
                "scmlogparserv2" -> print("scmlogparserv2")
                "csvexport" -> print("csvexport")
                "sourcecodeparser" -> print("sourcecodeparser")
                "understandimport" -> print("understandimport")
                "codemaatimport" -> print("codemaatimport")
                "jasomeimport" -> print("jasomeimport")
                "tokeiimporter" -> print("tokeiimporter")
                "rawtextparser" -> print("rawtextparser")
                else -> {
                    println("No valid parser was selected.")
                }
            }
        }
    }
}
