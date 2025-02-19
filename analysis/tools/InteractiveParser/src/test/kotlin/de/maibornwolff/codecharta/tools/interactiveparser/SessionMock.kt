package de.maibornwolff.codecharta.tools.interactiveparser

import com.varabyte.kotter.runtime.Session
import com.varabyte.kotterx.test.foundation.testSession
import io.mockk.every
import io.mockk.mockkStatic

class SessionMock {
    companion object {
        fun mockStartSession() {
            mockkStatic("de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterfaceKt")
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
