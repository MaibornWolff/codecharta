package de.maibornwolff.codecharta.tools.validation

import de.maibornwolff.codecharta.tools.interactiveparser.InteractiveParser
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
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

    companion object {
        const val SCHEMA_PATH = "cc.json"
    }

    override fun getDialog(): ParserDialogInterface = ParserDialog
    override fun isUsable(inputFile: String): Boolean {
        return false
    }
}
