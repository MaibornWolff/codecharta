package de.maibornwolff.codecharta.analysers.importers.sonar.dataaccess

import java.util.Base64

internal object AuthenticationHandler {
    fun createAuthTxtBase64Encoded(username: String): String {
        return createAuthTxtBase64Encoded(username, "")
    }

    fun createAuthTxtBase64Encoded(username: String, password: String): String {
        return String(Base64.getEncoder().encode(("$username:$password").toByteArray()))
    }
} // utility class
