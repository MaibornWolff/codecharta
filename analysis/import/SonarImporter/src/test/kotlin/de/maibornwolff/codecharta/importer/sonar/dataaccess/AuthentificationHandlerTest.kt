package de.maibornwolff.codecharta.importer.sonar.dataaccess

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class AuthentificationHandlerTest {

    @Test
    @Throws(Exception::class)
    fun createAuthWithPassword() {
        val password = "password"
        val expectedEncodedString = "dXNlcjpwYXNzd29yZA=="
        val encodedString = AuthentificationHandler.createAuthTxtBase64Encoded(USERNAME, password)
        assertEquals(encodedString, expectedEncodedString)
    }

    @Test
    @Throws(Exception::class)
    fun createAuthWithoutPassword() {
        val expectedEncodedString = "dXNlcjo="
        val encodedString = AuthentificationHandler.createAuthTxtBase64Encoded(USERNAME)
        assertEquals(encodedString, expectedEncodedString)
    }

    companion object {
        private const val USERNAME = "user"
    }
}
