package de.maibornwolff.codecharta.importer.sonar

import com.github.tomakehurst.wiremock.client.WireMock
import com.github.tomakehurst.wiremock.client.WireMock.getRequestedFor
import com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo
import com.github.tomakehurst.wiremock.client.WireMock.verify
import com.github.tomakehurst.wiremock.junit.WireMockRule
import de.maibornwolff.codecharta.importer.sonar.SonarImporterMain.Companion.main
import de.maibornwolff.codecharta.importer.sonar.dataaccess.SonarMetricsAPIDatasource
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import javax.ws.rs.core.MediaType
import kotlin.jvm.Throws

class SonarImporterMainTest {
    companion object {
        private const val PORT = 8089

        private const val METRIC_LIST_URL_PATH =
            "/api/metrics/search?f=hidden,decimalScale&p=1&ps=${SonarMetricsAPIDatasource.PAGE_SIZE}"
    }

    @JvmField
    @Rule
    var wireMockRule = WireMockRule(PORT)

    @Before
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

        main(arrayOf("http://localhost:8089/", "someproject"))

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

        main(arrayOf("http://localhost:8089", "someproject"))

        verify(1, getRequestedFor(urlEqualTo(METRIC_LIST_URL_PATH)))
    }
}
