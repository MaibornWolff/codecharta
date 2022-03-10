package de.maibornwolff.codecharta.tools.validation

import de.maibornwolff.codecharta.tools.validation.UserDialog.Companion.generateDialog
import picocli.CommandLine
import java.io.File
import java.io.FileInputStream
import java.util.concurrent.Callable

@CommandLine.Command(
    name = "check",
    description = ["validates cc.json files"],
    footer = ["Copyright(c) 2020, MaibornWolff GmbH"]
)
class ValidationTool : Callable<Void?> {

    private val schemaPath = "cc.json"

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    var help: Boolean = false

    @CommandLine.Parameters(index = "0", description = ["file to validate"])
    var file: String = ""

    override fun call(): Void? {
        EveritValidator(schemaPath).validate(FileInputStream(File(file).absoluteFile))

        return null
    }

    companion object {
        var SCHEMA_PATH = "cc.json"

        @JvmStatic
        fun main(args: Array<String>) {
            val commandLine = CommandLine(ValidationTool())
            generateDialog(args, commandLine)
        }
    }
}
