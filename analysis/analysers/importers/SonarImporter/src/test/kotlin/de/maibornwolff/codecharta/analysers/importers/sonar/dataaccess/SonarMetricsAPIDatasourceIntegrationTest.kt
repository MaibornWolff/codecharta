package de.maibornwolff.codecharta.analysers.importers.sonar.dataaccess

import com.github.tomakehurst.wiremock.client.WireMock.aResponse
import com.github.tomakehurst.wiremock.client.WireMock.get
import com.github.tomakehurst.wiremock.client.WireMock.stubFor
import com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo
import com.github.tomakehurst.wiremock.junit5.WireMockTest
import de.maibornwolff.codecharta.analysers.importers.sonar.SonarImporterException
import de.maibornwolff.codecharta.analysers.importers.sonar.dataaccess.SonarMetricsAPIDatasource.Companion.PAGE_SIZE
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import java.io.IOException
import java.net.MalformedURLException
import java.net.URL

private const val PORT = 8089

@WireMockTest(httpPort = PORT)
class SonarMetricsAPIDatasourceIntegrationTest {
    @Throws(IOException::class)
    private fun createMetricResponseAsJsonString(): String {
        return this.javaClass.classLoader.getResource("metrics.json")!!.readText()
    }

    @Test
    fun getNoOfPages() {
        assertNoOfPages(1499, 3)
        assertNoOfPages(1500, 3)
        assertNoOfPages(1501, 4)
        assertNoOfPages(0, 0)
        assertNoOfPages(1, 1)
    }

    private fun assertNoOfPages(total: Int, expectation: Int) {
        val ds = SonarMetricsAPIDatasource(createBaseUrl())
        val pages = ds.calculateNumberOfPages(total)
        assertEquals(pages, expectation)
    }

    @Test
    @Throws(Exception::class)
    fun getAvailableMetrics() { // given
        stubFor(
            get(urlEqualTo(metricListUrlPath(1))).willReturn(
                aResponse().withStatus(200).withHeader("Content-Type", "application/json")
                    .withBody(createMetricResponseAsJsonString())
            )
        )

        // when
        val ds = SonarMetricsAPIDatasource(createBaseUrl())
        val metricsList = ds.getAvailableMetrics(1).metrics!!.map { it.key }

        // then
        assertEquals(metricsList, listOf(*METRIC_ARRAY))
    }

    @Test
    @Throws(Exception::class)
    fun getAvailableMetricsList() { // given
        stubFor(
            get(urlEqualTo(metricListUrlPath(1))).willReturn(
                aResponse().withStatus(200).withHeader("Content-Type", "application/json")
                    .withBody(createMetricResponseAsJsonString())
            )
        )
        stubFor(
            get(urlEqualTo(metricListUrlPath(2))).willReturn(
                aResponse().withStatus(200).withHeader("Content-Type", "application/json")
                    .withBody(createMetricResponseAsJsonString())
            )
        )

        // when
        val ds = SonarMetricsAPIDatasource(createBaseUrl())
        val metricsList = ds.availableMetricKeys

        // then
        assertEquals(metricsList, listOf(*METRIC_ARRAY))
    }

    @Test
    @Throws(Exception::class)
    fun `getAvailableMetrics if authenticated`() { // given
        stubFor(
            get(urlEqualTo(metricListUrlPath(1))).withBasicAuth(USERNAME, "").willReturn(
                aResponse().withStatus(200).withHeader("Content-Type", "application/json")
                    .withBody(createMetricResponseAsJsonString())
            )
        )

        // when
        val ds = SonarMetricsAPIDatasource(USERNAME, createBaseUrl())
        val metricsList = ds.getAvailableMetrics(1).metrics!!.map { it.key }

        // then
        assertEquals(metricsList, listOf(*METRIC_ARRAY))
    }

    @Test
    @Throws(SonarImporterException::class)
    fun `getAvailableMetrics should throw exception if unauthorized`() { // given
        stubFor(
            get(urlEqualTo(metricListUrlPath(1))).willReturn(
                aResponse().withStatus(401)
            )
        )

        // when
        val ds = SonarMetricsAPIDatasource(createBaseUrl()) // then throw
        assertThrows(SonarImporterException::class.java) {
            ds.getAvailableMetrics(1)
        }
    }

    @Test
    @Throws(SonarImporterException::class)
    fun `getAvailableMetrics should throw exception if return code not oK`() { // given
        stubFor(
            get(urlEqualTo(metricListUrlPath(1))).willReturn(
                aResponse().withStatus(501)
            )
        )

        // when
        val ds = SonarMetricsAPIDatasource(createBaseUrl())

        // then throw
        assertThrows(SonarImporterException::class.java) {
            ds.getAvailableMetrics(1)
        }
    }

    @Test
    @Throws(Exception::class)
    fun `getNumberOfPages from server`() { // given
        stubFor(
            get(urlEqualTo(metricListUrlPath(1))).withBasicAuth(USERNAME, "").willReturn(
                aResponse().withStatus(200).withHeader("Content-Type", "application/json")
                    .withBody(createMetricResponseAsJsonString())
            )
        )

        // when
        val ds = SonarMetricsAPIDatasource(USERNAME, createBaseUrl())
        val numberOfPages = ds.numberOfPages

        // then
        assertEquals(numberOfPages, 1)
    }

    companion object {
        private val METRIC_ARRAY =
            arrayOf(
                "accessors",
                "blocker_violations",
                "public_api",
                "public_documented_api_density",
                "public_undocumented_api"
            )

        private const val USERNAME = "somename"

        private fun metricListUrlPath(page: Int): String {
            return "/api/metrics/search?f=hidden,decimalScale&p=$page&ps=$PAGE_SIZE"
        }

        private fun createBaseUrl(): URL {
            try {
                return URL("http://localhost:$PORT")
            } catch (e: MalformedURLException) {
                throw RuntimeException(e)
            }
        }
    }
}
