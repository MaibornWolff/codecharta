package de.maibornwolff.codecharta.ccsh

import com.varabyte.kotter.runtime.Session
import com.varabyte.kotterx.test.foundation.testSession
import de.maibornwolff.codecharta.analysers.interactiveparser.runInTerminalSession
import io.mockk.every
import io.mockk.mockkStatic

class SessionMock {
    companion object {
        fun mockRunInTerminalSession() {
            mockkStatic("de.maibornwolff.codecharta.analysers.interactiveparser.ParserDialogInterfaceKt")
            every { runInTerminalSession(any<Session.() -> Any>()) } answers {
                runInTestSession { firstArg<Session.() -> Any>()(this) }
            }
        }

        private fun <T> runInTestSession(block: Session.() -> T): T {
            var returnValue: T? = null
            testSession {
                returnValue = block()
            }
            return returnValue ?: throw IllegalStateException("Session did not return a value.")
        }
    }
}
