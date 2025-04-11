package de.maibornwolff.codecharta.analysers.importers.sonar.dataaccess

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class AuthenticationHandlerTest {
    @Test
    @Throws(Exception::class)
    fun createAuthWithPassword() {
        val password = "password"
        val expectedEncodedString = "dXNlcjpwYXNzd29yZA=="
        val encodedString = AuthenticationHandler.createAuthTxtBase64Encoded(USERNAME, password)
        assertEquals(encodedString, expectedEncodedString)
    }

    @Test
    @Throws(Exception::class)
    fun createAuthWithoutPassword() {
        val expectedEncodedString = "dXNlcjo="
        val encodedString = AuthenticationHandler.createAuthTxtBase64Encoded(USERNAME)
        assertEquals(encodedString, expectedEncodedString)
    }

    companion object {
        private const val USERNAME = "user"
    }
}
