package de.maibornwolff.codecharta.importer.sonar

import com.github.tomakehurst.wiremock.client.WireMock
import com.github.tomakehurst.wiremock.client.WireMock.*
import com.github.tomakehurst.wiremock.junit.WireMockRule
import de.maibornwolff.codecharta.importer.sonar.SonarImporterMain.Companion.main
import de.maibornwolff.codecharta.importer.sonar.dataaccess.SonarMetricsAPIDatasource

import org.junit.Rule
import org.junit.Test

class SonarImporterMainTest {
    companion object {
        private const val PORT = 8089

        private val METRIC_LIST_URL_PATH =
                "/api/metrics/search?f=hidden,decimalScale&p=1&ps=${SonarMetricsAPIDatasource.PAGE_SIZE}"

    }

    @JvmField
    @Rule
    var wireMockRule = WireMockRule(PORT)

    @Test
    @Throws(Exception::class)
    fun `should call correct url with trailing backslash in URL parameter`() {
        WireMock.stubFor(
                WireMock.get(WireMock.urlEqualTo(METRIC_LIST_URL_PATH))
                        .willReturn(WireMock.aResponse()
                                .withStatus(200)
                                .withHeader("Content-Type", "application/json")
                                .withBody("{\"metrics\": [],\"total\": 0, \"p\": 0, \"ps\": 0}")))


        main(arrayOf("http://localhost:8089/",  "someproject"))

        verify ( 1, getRequestedFor(urlEqualTo(METRIC_LIST_URL_PATH)) )
    }

    @Test
    @Throws(Exception::class)
    fun `should call correct url without trailing backslash in URL parameter`() {
        WireMock.stubFor(
                WireMock.get(WireMock.urlEqualTo(METRIC_LIST_URL_PATH))
                        .willReturn(WireMock.aResponse()
                                .withStatus(200)
                                .withHeader("Content-Type", "application/json")
                                .withBody("{\"metrics\": [],\"total\": 0, \"p\": 0, \"ps\": 0}")))


        main(arrayOf("http://localhost:8089",  "someproject"))

        verify ( 1, getRequestedFor(urlEqualTo(METRIC_LIST_URL_PATH)) )
    }
}