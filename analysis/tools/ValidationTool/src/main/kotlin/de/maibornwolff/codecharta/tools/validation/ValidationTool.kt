package de.maibornwolff.codecharta.tools.validation

import de.maibornwolff.codecharta.tools.interactiveparser.InteractiveParser
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import de.maibornwolff.codecharta.tools.interactiveparser.util.CodeChartaConstants
import de.maibornwolff.codecharta.util.InputHelper
import picocli.CommandLine
import java.io.File
import java.io.FileInputStream
import java.util.concurrent.Callable

@CommandLine.Command(
        name = ValidationTool.NAME,
        description = [ValidationTool.DESCRIPTION],
        footer = [CodeChartaConstants.General.GENERIC_FOOTER]
)
class ValidationTool : Callable<Void?>, InteractiveParser {

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    var help: Boolean = false

    @CommandLine.Parameters(index = "0", arity = "1", paramLabel = "FILE", description = ["file to validate"])
    var file: File? = null

    override val name = NAME
    override val description = DESCRIPTION

    companion object {
        const val NAME = "check"
        const val DESCRIPTION = "validates cc.json files"

        const val SCHEMA_PATH = "cc.json"
    }

    override fun call(): Void? {
        if (!InputHelper.isInputValidAndNotNull(arrayOf(file), canInputContainFolders = false)) {
            throw IllegalArgumentException("Input invalid file for ValidationTool, stopping execution...")
        }

        EveritValidator(SCHEMA_PATH).validate(FileInputStream(file!!.absoluteFile))

        return null
    }

    override fun getDialog(): ParserDialogInterface = ParserDialog
    override fun isApplicable(resourceToBeParsed: String): Boolean {
        return false
    }
}
