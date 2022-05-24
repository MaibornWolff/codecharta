package de.maibornwolff.codecharta.tools.validation

import de.maibornwolff.codecharta.tools.interactiveparser.InteractiveParser
import de.maibornwolff.codecharta.tools.validation.ParserDialog.Companion.collectParserArgs
import picocli.CommandLine
import java.io.File
import java.io.FileInputStream
import java.util.concurrent.Callable

@CommandLine.Command(
    name = "check",
    description = ["validates cc.json files"],
    footer = ["Copyright(c) 2020, MaibornWolff GmbH"]
)
class ValidationTool : Callable<Void?>, InteractiveParser {

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    var help: Boolean = false

    @CommandLine.Parameters(index = "0", description = ["file to validate"])
    var file: String = ""

    override fun call(): Void? {
        EveritValidator(SCHEMA_PATH).validate(FileInputStream(File(file).absoluteFile))

        return null
    }

    override fun callInteractive() {
        val commandLine = CommandLine(this)
        val collectedArgs = collectParserArgs()
        commandLine.execute(*collectedArgs.toTypedArray())
    }

    companion object {
        val SCHEMA_PATH = "cc.json"
    }
}
