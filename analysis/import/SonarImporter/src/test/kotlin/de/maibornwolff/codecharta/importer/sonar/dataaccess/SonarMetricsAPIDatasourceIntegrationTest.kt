package de.maibornwolff.codecharta.importer.sonar.dataaccess

import com.github.tomakehurst.wiremock.client.WireMock.aResponse
import com.github.tomakehurst.wiremock.client.WireMock.get
import com.github.tomakehurst.wiremock.client.WireMock.stubFor
import com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo
import com.github.tomakehurst.wiremock.junit.WireMockRule
import de.maibornwolff.codecharta.importer.sonar.SonarImporterException
import de.maibornwolff.codecharta.importer.sonar.dataaccess.SonarMetricsAPIDatasource.Companion.PAGE_SIZE
import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers.`is`
import org.junit.Assert
import org.junit.Rule
import org.junit.Test
import java.io.IOException
import java.net.MalformedURLException
import java.net.URL
import java.util.Arrays

class SonarMetricsAPIDatasourceIntegrationTest {
    @JvmField
    @Rule
    var wireMockRule = WireMockRule(PORT)

    @Throws(IOException::class)
    private fun createMetricResponseAsJsonString(): String {
        return this.javaClass.classLoader.getResource("metrics.json").readText()
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
        assertThat(pages, `is`(expectation))
    }

    @Test
    @Throws(Exception::class)
    fun getAvailableMetrics() {
        // given
        stubFor(
            get(urlEqualTo(METRIC_LIST_URL_PATH(1)))
                .willReturn(
                    aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody(createMetricResponseAsJsonString())
                )
        )

        // when
        val ds = SonarMetricsAPIDatasource(createBaseUrl())
        val metricsList = ds.getAvailableMetrics(1).metrics!!.map { it.key }

        // then
        assertThat(metricsList, `is`(Arrays.asList(*METRIC_ARRAY)))
    }

    @Test
    @Throws(Exception::class)
    fun getAvailableMetricsList() {
        // given
        stubFor(
            get(urlEqualTo(METRIC_LIST_URL_PATH(1)))
                .willReturn(
                    aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody(createMetricResponseAsJsonString())
                )
        )
        stubFor(
            get(urlEqualTo(METRIC_LIST_URL_PATH(2)))
                .willReturn(
                    aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody(createMetricResponseAsJsonString())
                )
        )

        // when
        val ds = SonarMetricsAPIDatasource(createBaseUrl())
        val metricsList = ds.availableMetricKeys

        // then
        assertThat(metricsList, `is`(Arrays.asList(*METRIC_ARRAY)))
    }

    @Test
    @Throws(Exception::class)
    fun getAvailableMetrics_if_authenticated() {
        // given
        stubFor(
            get(urlEqualTo(METRIC_LIST_URL_PATH(1))).withBasicAuth(USERNAME, "")
                .willReturn(
                    aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody(createMetricResponseAsJsonString())
                )
        )

        // when
        val ds = SonarMetricsAPIDatasource(USERNAME, createBaseUrl())
        val metricsList = ds.getAvailableMetrics(1).metrics!!.map { it.key }

        // then
        assertThat(metricsList, `is`(Arrays.asList(*METRIC_ARRAY)))
    }

    @Test(expected = SonarImporterException::class)
    @Throws(Exception::class)
    fun getAvailableMetrics_should_throw_exception_if_unauthorized() {
        // given
        stubFor(
            get(urlEqualTo(METRIC_LIST_URL_PATH(1)))
                .willReturn(
                    aResponse()
                        .withStatus(401)
                )
        )

        // when
        val ds = SonarMetricsAPIDatasource(createBaseUrl())
        ds.getAvailableMetrics(1)

        // then throw
    }

    @Test(expected = SonarImporterException::class)
    @Throws(Exception::class)
    fun getAvailableMetrics_should_throw_exception_if_return_code_not_oK() {
        // given
        stubFor(
            get(urlEqualTo(METRIC_LIST_URL_PATH(1)))
                .willReturn(
                    aResponse()
                        .withStatus(501)
                )
        )

        // when
        val ds = SonarMetricsAPIDatasource(createBaseUrl())
        ds.getAvailableMetrics(1)

        // then throw
    }

    @Test
    @Throws(Exception::class)
    fun getNumberOfPages_from_server() {
        // given
        stubFor(
            get(urlEqualTo(METRIC_LIST_URL_PATH(1))).withBasicAuth(USERNAME, "")
                .willReturn(
                    aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody(createMetricResponseAsJsonString())
                )
        )

        // when
        val ds = SonarMetricsAPIDatasource(USERNAME, createBaseUrl())
        val numberOfPages = ds.numberOfPages

        // then
        Assert.assertThat(numberOfPages, `is`(1))
    }

    companion object {

        private val METRIC_ARRAY =
            arrayOf(
                "accessors", "blocker_violations", "public_api", "public_documented_api_density",
                "public_undocumented_api"
            )

        private const val PORT = 8089
        private const val USERNAME = "somename"

        private fun METRIC_LIST_URL_PATH(page: Int): String {
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
