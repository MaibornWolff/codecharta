package de.maibornwolff.codecharta.importer.sonar

import com.github.tomakehurst.wiremock.client.WireMock
import com.github.tomakehurst.wiremock.client.WireMock.getRequestedFor
import com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo
import com.github.tomakehurst.wiremock.client.WireMock.verify
import com.github.tomakehurst.wiremock.junit5.WireMockTest
import de.maibornwolff.codecharta.importer.sonar.dataaccess.SonarMetricsAPIDatasource
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import picocli.CommandLine
import javax.ws.rs.core.MediaType
import kotlin.jvm.Throws

private const val PORT = 8089

@WireMockTest(httpPort = PORT)
class SonarImporterMainTest {
    companion object {
        private const val METRIC_LIST_URL_PATH =
            "/api/metrics/search?f=hidden,decimalScale&p=1&ps=${SonarMetricsAPIDatasource.PAGE_SIZE}"
    }

    @BeforeEach
    fun mockVersionRequest() {
        WireMock.stubFor(
            WireMock.get(urlEqualTo("/api/server/version"))
                .willReturn(
                    WireMock.aResponse()
                        .withHeader("Content-Type", MediaType.TEXT_PLAIN + "; charset=utf-8")
                        .withStatus(200)
                        .withBody("7.8.0.0")
                )
        )
    }

    @Test
    @Throws(Exception::class)
    fun `should call correct url with trailing backslash in URL parameter`() {
        WireMock.stubFor(
            WireMock.get(urlEqualTo(METRIC_LIST_URL_PATH))
                .willReturn(
                    WireMock.aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody("{\"metrics\": [],\"total\": 0, \"p\": 0, \"ps\": 0}")
                )
        )

        CommandLine(SonarImporterMain()).execute(*arrayOf("http://localhost:8089/", "someproject"))

        verify(1, getRequestedFor(urlEqualTo(METRIC_LIST_URL_PATH)))
    }

    @Test
    @Throws(Exception::class)
    fun `should call correct url without trailing backslash in URL parameter`() {
        WireMock.stubFor(
            WireMock.get(urlEqualTo(METRIC_LIST_URL_PATH))
                .willReturn(
                    WireMock.aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody("{\"metrics\": [],\"total\": 0, \"p\": 0, \"ps\": 0}")
                )
        )

        CommandLine(SonarImporterMain()).execute(*arrayOf("http://localhost:8089", "someproject"))

        verify(1, getRequestedFor(urlEqualTo(METRIC_LIST_URL_PATH)))
    }
}
