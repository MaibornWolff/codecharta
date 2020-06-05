package de.maibornwolff.codecharta.importer.sonar.dataaccess

import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers.`is`
import org.junit.Test

class AuthentificationHandlerTest {
    @Test
    @Throws(Exception::class)
    fun createAuthWithPassword() {
        val password = "password"
        val expectedEncodedString = "dXNlcjpwYXNzd29yZA=="
        val encodedString = AuthentificationHandler.createAuthTxtBase64Encoded(USERNAME, password)
        assertThat(encodedString, `is`(expectedEncodedString))
    }

    @Test
    @Throws(Exception::class)
    fun createAuthWithoutPassword() {
        val expectedEncodedString = "dXNlcjo="
        val encodedString = AuthentificationHandler.createAuthTxtBase64Encoded(USERNAME)
        assertThat(encodedString, `is`(expectedEncodedString))
    }

    companion object {
        private const val USERNAME = "user"
    }
}