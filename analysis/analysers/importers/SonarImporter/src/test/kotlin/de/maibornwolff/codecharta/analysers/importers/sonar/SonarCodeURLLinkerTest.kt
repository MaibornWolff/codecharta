package de.maibornwolff.codecharta.analysers.importers.sonar

import de.maibornwolff.codecharta.analysers.importers.sonar.model.Component
import de.maibornwolff.codecharta.analysers.importers.sonar.model.Qualifier
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import java.net.URL

class SonarCodeURLLinkerTest {
    @Test
    @Throws(Exception::class)
    fun `should createUrlString`() { // given
        val baseUrl = URL("https://sonarcloud.io")
        val component =
            Component(
                "",
                "com.adobe%3Aas3corelib%3Asrc%2Fcom%2Fadobe%2Fair%2Fcrypto%2FEncryptionKeyGenerator.as",
                "",
                "",
                Qualifier.FIL
            )

        // when
        val urlString = SonarCodeURLLinker(baseUrl).createUrlString(component)

        // then
        assertEquals(
            urlString,
            "https://sonarcloud.io/code?id=com.adobe%3Aas3corelib%3Asrc%2Fcom%2Fadobe%2Fair%2Fcrypto%2FEncryptionKeyGenerator.as"
        )
    }
}
