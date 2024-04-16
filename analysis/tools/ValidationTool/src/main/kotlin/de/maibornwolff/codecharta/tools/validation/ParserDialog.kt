package de.maibornwolff.codecharta.tools.validation

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptInput
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import de.maibornwolff.codecharta.util.Logger
import io.github.oshai.kotlinlogging.KotlinLogging
import java.io.File
import java.nio.file.Paths

class ParserDialog {
    companion object : ParserDialogInterface {
        private const val EXTENSION = "cc.json"

        override fun collectParserArgs(): List<String> {
            val inputFileName = KInquirer.promptInput(message = "Which $EXTENSION file do you want to validate?",
                    hint = Paths.get("").toAbsolutePath().toString() + File.separator + "yourInput." + EXTENSION)
            Logger.logger.info { "File path: $inputFileName" }

            return listOf(inputFileName)
        }
    }
}
