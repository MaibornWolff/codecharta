package de.maibornwolff.codecharta.tools.validation

import de.maibornwolff.codecharta.tools.interactiveparser.InteractiveParser
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import de.maibornwolff.codecharta.tools.interactiveparser.util.InteractiveParserHelper
import de.maibornwolff.codecharta.util.InputHelper
import mu.KotlinLogging
import picocli.CommandLine
import java.io.File
import java.io.FileInputStream
import java.util.concurrent.Callable

@CommandLine.Command(
    name = InteractiveParserHelper.ValidationToolConstants.name,
    description = [InteractiveParserHelper.ValidationToolConstants.description],
    footer = [InteractiveParserHelper.GeneralConstants.GenericFooter]
)
class ValidationTool : Callable<Void?>, InteractiveParser {

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    var help: Boolean = false

    @CommandLine.Parameters(index = "0", description = ["file to validate"])
    var file: String = ""

    override fun call(): Void? {
        if (!InputHelper.isInputValid(arrayOf(File(file)), canInputBePiped = false, canInputContainFolders = false)) {
            logger.error("Input invalid file for ValidationTool, stopping execution...")
            return null
        }

        EveritValidator(SCHEMA_PATH).validate(FileInputStream(File(file).absoluteFile))

        return null
    }

    companion object {
        private val logger = KotlinLogging.logger {}

        const val SCHEMA_PATH = "cc.json"
    }

    override fun getDialog(): ParserDialogInterface = ParserDialog
    override fun isApplicable(resourceToBeParsed: String): Boolean {
        return false
    }
    override fun getName(): String {
        return InteractiveParserHelper.ValidationToolConstants.name
    }
}
