package de.maibornwolff.codecharta.importer.sonar.dataaccess

import com.github.tomakehurst.wiremock.client.WireMock.aResponse
import com.github.tomakehurst.wiremock.client.WireMock.get
import com.github.tomakehurst.wiremock.client.WireMock.stubFor
import com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo
import com.github.tomakehurst.wiremock.junit.WireMockRule
import de.maibornwolff.codecharta.importer.sonar.SonarImporterException
import org.junit.Assert.assertEquals
import org.junit.Rule
import org.junit.Test
import org.junit.jupiter.api.assertThrows
import java.net.MalformedURLException
import java.net.URL
import javax.ws.rs.core.MediaType

class SonarVersionAPIDatasourceIntegrationTest {

    @Rule
    @JvmField
    var wireMockRule = WireMockRule(PORT)
    private val versionAPIDatasource = SonarVersionAPIDatasource("somename", createBaseUrl())

    @Test
    fun `should parse the version to 6 point 6`() {
        stubFor(
            get(urlEqualTo(URL_PATH))
                .willReturn(
                    aResponse()
                        .withHeader("Content-Type", MediaType.TEXT_PLAIN + "; charset=utf-8")
                        .withStatus(200)
                        .withBody("6.5.3.1234")
                )
        )

        val version = versionAPIDatasource.getSonarqubeVersion()

        assertEquals(version.major, 6)
        assertEquals(version.minor, 5)
    }

    @Test
    fun `should fallback to default version`() {
        stubFor(
            get(urlEqualTo(URL_PATH))
                .willReturn(
                    aResponse()
                        .withHeader("Content-Type", MediaType.TEXT_PLAIN + "; charset=utf-8")
                        .withStatus(200)
                        .withBody("6")
                )
        )

        val version = versionAPIDatasource.getSonarqubeVersion()

        assertEquals(version.major, 6)
        assertEquals(version.minor, 5)
    }

    @Test
    fun `should throw an exception if we encounter an error during the request`() {
        stubFor(
            get(urlEqualTo(URL_PATH))
                .willReturn(
                    aResponse()
                        .withHeader("Content-Type", MediaType.TEXT_PLAIN + "; charset=utf-8")
                        .withStatus(400)
                        .withBody("6")
                )
        )

        assertThrows<SonarImporterException> { versionAPIDatasource.getSonarqubeVersion() }
    }

    companion object {
        private const val PORT = 8089
        private const val URL_PATH = "/api/server/version"

        private fun createBaseUrl(): URL {
            try {
                return URL("http://localhost:$PORT")
            } catch (e: MalformedURLException) {
                throw RuntimeException(e)
            }
        }
    }
}
