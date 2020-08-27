package de.maibornwolff.codecharta.importer.sonar

import de.maibornwolff.codecharta.importer.sonar.model.Component
import de.maibornwolff.codecharta.importer.sonar.model.Qualifier
import org.hamcrest.CoreMatchers.`is`
import org.junit.Assert.assertThat
import org.junit.Test
import java.net.URL

class SonarCodeURLLinkerTest {
    @Test
    @Throws(Exception::class)
    fun should_createUrlString() {
        // given
        val baseUrl = URL("https://sonarcloud.io")
        val component =
            Component(
                "", "com.adobe%3Aas3corelib%3Asrc%2Fcom%2Fadobe%2Fair%2Fcrypto%2FEncryptionKeyGenerator.as",
                "", "", Qualifier.FIL
            )

        // when
        val urlString = SonarCodeURLLinker(baseUrl).createUrlString(component)

        // then
        assertThat(
            urlString,
            `is`("https://sonarcloud.io/code?id=com.adobe%3Aas3corelib%3Asrc%2Fcom%2Fadobe%2Fair%2Fcrypto%2FEncryptionKeyGenerator.as")
        )
    }
}
