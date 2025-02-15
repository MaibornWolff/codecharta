package de.maibornwolff.codecharta.tools.interactiveparser

import com.varabyte.kotter.runtime.Session

interface ParserDialogInterface {
    fun collectParserArgs(session: Session): List<String>
}
