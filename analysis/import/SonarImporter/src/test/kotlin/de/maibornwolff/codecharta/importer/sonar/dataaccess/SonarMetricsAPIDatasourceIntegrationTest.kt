/*
 * Copyright (c) 2017, MaibornWolff GmbH
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *  * Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *  * Neither the name of  nor the names of its contributors may be used to
 *    endorse or promote products derived from this software without specific
 *    prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

package de.maibornwolff.codecharta.importer.sonar.dataaccess

import com.github.tomakehurst.wiremock.client.WireMock.*
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
import java.util.*

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
        stubFor(get(urlEqualTo(METRIC_LIST_URL_PATH(1)))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody(createMetricResponseAsJsonString())))

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
        stubFor(get(urlEqualTo(METRIC_LIST_URL_PATH(1)))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody(createMetricResponseAsJsonString())))
        stubFor(get(urlEqualTo(METRIC_LIST_URL_PATH(2)))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody(createMetricResponseAsJsonString())))

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
        stubFor(get(urlEqualTo(METRIC_LIST_URL_PATH(1))).withBasicAuth(USERNAME, "")
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody(createMetricResponseAsJsonString())))

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
        stubFor(get(urlEqualTo(METRIC_LIST_URL_PATH(1)))
                .willReturn(aResponse()
                        .withStatus(401)))

        // when
        val ds = SonarMetricsAPIDatasource(createBaseUrl())
        ds.getAvailableMetrics(1)

        // then throw
    }

    @Test(expected = SonarImporterException::class)
    @Throws(Exception::class)
    fun getAvailableMetrics_should_throw_exception_if_return_code_not_oK() {
        // given
        stubFor(get(urlEqualTo(METRIC_LIST_URL_PATH(1)))
                .willReturn(aResponse()
                        .withStatus(501)))

        // when
        val ds = SonarMetricsAPIDatasource(createBaseUrl())
        ds.getAvailableMetrics(1)

        // then throw
    }


    @Test
    @Throws(Exception::class)
    fun getNumberOfPages_from_server() {
        // given
        stubFor(get(urlEqualTo(METRIC_LIST_URL_PATH(1))).withBasicAuth(USERNAME, "")
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody(createMetricResponseAsJsonString())))

        // when
        val ds = SonarMetricsAPIDatasource(USERNAME, createBaseUrl())
        val numberOfPages = ds.numberOfPages

        // then
        Assert.assertThat(numberOfPages, `is`(1))
    }

    companion object {

        private val METRIC_ARRAY = arrayOf("accessors", "blocker_violations", "public_api", "public_documented_api_density", "public_undocumented_api")

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