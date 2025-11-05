package de.maibornwolff.codecharta.analysers.tools.multicommit

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface

class Dialog {
    companion object : AnalyserDialogInterface {
        override fun collectAnalyserArgs(session: Session): List<String> {
            // TODO: Implementation will be added in task 5
            return emptyList()
        }

        internal fun testCallback(): suspend RunScope.() -> Unit = {}
    }
}
