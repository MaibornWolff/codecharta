package de.maibornwolff.codecharta.analysers.importers.sonar.dataaccess

import com.github.tomakehurst.wiremock.client.WireMock.aResponse
import com.github.tomakehurst.wiremock.client.WireMock.get
import com.github.tomakehurst.wiremock.client.WireMock.stubFor
import com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo
import com.github.tomakehurst.wiremock.junit5.WireMockTest
import de.maibornwolff.codecharta.analysers.importers.sonar.SonarImporterException
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.net.MalformedURLException
import java.net.URL
import javax.ws.rs.core.MediaType

private const val PORT = 8089

@WireMockTest(httpPort = PORT)
class SonarVersionAPIDatasourceIntegrationTest {
    private val versionAPIDatasource = SonarVersionAPIDatasource("somename", createBaseUrl())

    @Test
    fun `should parse the version to 6 point 6`() {
        stubFor(
            get(urlEqualTo(URL_PATH)).willReturn(
                aResponse().withHeader("Content-Type", MediaType.TEXT_PLAIN + "; charset=utf-8").withStatus(200)
                    .withBody("6.5.3.1234")
            )
        )

        val version = versionAPIDatasource.getSonarqubeVersion()

        assertEquals(version.major, 6)
        assertEquals(version.minor, 5)
    }

    @Test
    fun `should fallback to default version if version is not parsable`() {
        stubFor(
            get(urlEqualTo(URL_PATH)).willReturn(
                aResponse().withHeader("Content-Type", MediaType.TEXT_PLAIN + "; charset=utf-8")
                    .withStatus(200)
            )
        )

        val version = versionAPIDatasource.getSonarqubeVersion()

        assertEquals(version.major, SonarVersionAPIDatasource.DEFAULT_VERSION.major)
        assertEquals(version.minor, SonarVersionAPIDatasource.DEFAULT_VERSION.minor)
    }

    @Test
    fun `should parse the version even if minor is missing`() {
        stubFor(
            get(urlEqualTo(URL_PATH)).willReturn(
                aResponse().withHeader("Content-Type", MediaType.TEXT_PLAIN + "; charset=utf-8").withStatus(200)
                    .withBody("6")
            )
        )

        val version = versionAPIDatasource.getSonarqubeVersion()

        assertEquals(version.major, 6)
        assertEquals(version.minor, 0)
    }

    @Test
    fun `should throw an exception if version endpoint is not available`() {
        stubFor(
            get(urlEqualTo(URL_PATH)).willReturn(
                aResponse().withHeader("Content-Type", MediaType.TEXT_PLAIN + "; charset=utf-8")
                    .withStatus(404)
            )
        )

        assertThrows<SonarImporterException> { versionAPIDatasource.getSonarqubeVersion() }
    }

    companion object {
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
