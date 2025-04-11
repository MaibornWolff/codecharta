package de.maibornwolff.codecharta.analysers.importers.sonar.dataaccess

import com.github.tomakehurst.wiremock.client.ResponseDefinitionBuilder
import com.github.tomakehurst.wiremock.client.ResponseDefinitionBuilder.jsonResponse
import com.github.tomakehurst.wiremock.client.WireMock.aResponse
import com.github.tomakehurst.wiremock.client.WireMock.get
import com.github.tomakehurst.wiremock.client.WireMock.stubFor
import com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo
import com.github.tomakehurst.wiremock.junit5.WireMockTest
import com.google.gson.GsonBuilder
import de.maibornwolff.codecharta.analysers.importers.sonar.SonarImporterException
import de.maibornwolff.codecharta.analysers.importers.sonar.dataaccess.SonarMetricsAPIDatasource.Companion.PAGE_SIZE
import de.maibornwolff.codecharta.analysers.importers.sonar.model.ErrorEntity
import de.maibornwolff.codecharta.analysers.importers.sonar.model.ErrorResponse
import de.maibornwolff.codecharta.analysers.importers.sonar.model.Measures
import de.maibornwolff.codecharta.analysers.importers.sonar.model.Version
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import java.io.IOException
import java.net.MalformedURLException
import java.net.URI
import java.net.URL

private const val PORT = 8089

@WireMockTest(httpPort = PORT)
class SonarMeasuresAPIDatasourceIntegrationTest {
    @Throws(IOException::class)
    private fun createResponseString(): String {
        return this.javaClass.classLoader.getResource("sonarqube_measures.json")!!.readText()
    }

    @Throws(IOException::class)
    private fun createPagedResponseString(page: Number): String {
        return this.javaClass.classLoader.getResource("sonarqube_measures_paged_$page.json")!!.readText()
    }

    @Throws(IOException::class)
    private fun createExpectedMeasures(): Measures {
        val responseString = createResponseString()
        return GSON.fromJson(responseString, Measures::class.java)
    }

    @Throws(IOException::class)
    private fun createExpectedPagedMeasures(page: Number): Measures {
        val responseString = createPagedResponseString(page)
        return GSON.fromJson(responseString, Measures::class.java)
    }

    @Test
    @Throws(Exception::class)
    fun `getComponentMap from server if no authentication needed and result is paged`() { // given
        stubFor(
            get(urlEqualTo(URL_PATH)).willReturn(
                aResponse().withHeader("Content-Type", "application/json").withStatus(200)
                    .withBody(createPagedResponseString(1))
            )
        )

        stubFor(
            get(urlEqualTo(URL_PATH_SECOND_PAGE)).willReturn(
                aResponse().withHeader("Content-Type", "application/json").withStatus(200)
                    .withBody(createPagedResponseString(2))
            )
        )

        stubFor(
            get(urlEqualTo(URL_PATH_THIRD_PAGE)).willReturn(
                aResponse().withHeader("Content-Type", "application/json").withStatus(200)
                    .withBody(createPagedResponseString(3))
            )
        )

        // when
        val measuresApiDatasource = SonarMeasuresAPIDatasource("", createBaseUrl())

        val componentMap = measuresApiDatasource.getComponentMap(PROJECT_KEY, listOf("coverage"))

        // then
        assertEquals(componentMap.componentList.size, 5)
    }

    @Test
    @Throws(Exception::class)
    fun `getMeasures page from server if no authentication needed and result is paged`() { // given
        stubFor(
            get(urlEqualTo(URL_PATH)).willReturn(
                aResponse().withHeader("Content-Type", "application/json").withStatus(200)
                    .withBody(createPagedResponseString(1))
            )
        )

        stubFor(
            get(urlEqualTo(URL_PATH_SECOND_PAGE)).willReturn(
                aResponse().withHeader("Content-Type", "application/json").withStatus(200)
                    .withBody(createPagedResponseString(2))
            )
        )

        stubFor(
            get(urlEqualTo(URL_PATH_THIRD_PAGE)).willReturn(
                aResponse().withHeader("Content-Type", "application/json").withStatus(200)
                    .withBody(createPagedResponseString(3))
            )
        )

        // when
        val measuresApiDatasource = SonarMeasuresAPIDatasource("", createBaseUrl())

        val measures1 = measuresApiDatasource.getMeasuresFromPage(PROJECT_KEY, listOf("coverage"), 1)
        val measures2 = measuresApiDatasource.getMeasuresFromPage(PROJECT_KEY, listOf("coverage"), 2)
        val measures3 = measuresApiDatasource.getMeasuresFromPage(PROJECT_KEY, listOf("coverage"), 3)

        // then
        assertEquals(measures1, createExpectedPagedMeasures(1))
        assertEquals(measures2, createExpectedPagedMeasures(2))
        assertEquals(measures3, createExpectedPagedMeasures(3))
    }

    @Test
    @Throws(Exception::class)
    fun `getMeasures from server if no authentication needed`() { // given
        stubFor(
            get(urlEqualTo(URL_PATH)).willReturn(
                aResponse().withHeader("Content-Type", "application/json").withStatus(200)
                    .withBody(createResponseString())
            )
        )

        // when
        val measuresApiDatasource = SonarMeasuresAPIDatasource("", createBaseUrl())
        val measures = measuresApiDatasource.getMeasuresFromPage(PROJECT_KEY, listOf("coverage"), 1)

        // then
        assertEquals(measures, createExpectedMeasures())
    }

    @Test
    @Throws(Exception::class)
    fun `getMeasures from server if authenticated`() { // given
        stubFor(
            get(urlEqualTo(URL_PATH)).withBasicAuth(USERNAME, "").willReturn(
                aResponse().withHeader("Content-Type", "application/json").withStatus(200)
                    .withBody(createResponseString())
            )
        )

        // when
        val measuresApiDatasource = SonarMeasuresAPIDatasource(USERNAME, createBaseUrl())
        val measures = measuresApiDatasource.getMeasuresFromPage(PROJECT_KEY, listOf("coverage"), 1)

        // then
        assertEquals(measures, createExpectedMeasures())
    }

    @Test
    @Throws(SonarImporterException::class)
    fun `getMeasures throws exception if bad request`() { // given
        val error = ErrorEntity("some Error")
        val errorResponse = ErrorResponse(arrayOf(error))
        stubFor(
            get(urlEqualTo(URL_PATH)).withBasicAuth(USERNAME, "").willReturn(
                ResponseDefinitionBuilder.like(
                    jsonResponse(errorResponse, 400)
                )
            )
        )

        // when
        val measuresApiDatasource = SonarMeasuresAPIDatasource(USERNAME, createBaseUrl())

        // then throws
        assertThrows(SonarImporterException::class.java) {
            measuresApiDatasource.getMeasuresFromPage(PROJECT_KEY, listOf("coverage"), 1)
        }
    }

    @Test
    fun createMeasureAPIRequestURI() {
        val expectedMeasuresAPIRequestURI =
            URI(createBaseUrl().toString() + "/api/measures/component_tree?component=&qualifiers=FIL,UTS&metricKeys=coverage&p=0&ps=500")

        val measuresApiDatasource = SonarMeasuresAPIDatasource("", createBaseUrl())
        val measureAPIRequestURI = measuresApiDatasource.createMeasureAPIRequestURI("", listOf("coverage"), 0)

        assertEquals(measureAPIRequestURI, expectedMeasuresAPIRequestURI)
    }

    @Test
    fun `createMeasureAPIRequestURI without metrics throws exception`() {
        val measuresApiDatasource = SonarMeasuresAPIDatasource("", createBaseUrl())

        assertThrows(IllegalArgumentException::class.java) {
            measuresApiDatasource.createMeasureAPIRequestURI("", listOf(), 0)
        }
    }

    @Test
    fun `createMeasureAPIRequestURI illegal character in metrics should throw exception`() {
        val measuresApiDatasource = SonarMeasuresAPIDatasource("", createBaseUrl())

        assertThrows(SonarImporterException::class.java) {
            measuresApiDatasource.createMeasureAPIRequestURI("", listOf(" "), 0)
        }
    }

    @Test
    @Throws(Exception::class)
    fun getComponents_from_server_if_no_authentication_needed() {
        stubFor(
            get(urlEqualTo(URL_PATH)).willReturn(
                aResponse().withHeader("Content-Type", "application/json").withStatus(200)
                    .withBody(createResponseString())
            )
        )

        val measuresApiDatasource = SonarMeasuresAPIDatasource("", createBaseUrl())
        val components = measuresApiDatasource.getComponentMap(PROJECT_KEY, listOf("coverage"))

        assertEquals(components.componentList.count(), 34)
    }

    @Test
    fun `should use deprecated query parameters if sonarqube version is too old`() {
        stubFor(
            get(urlEqualTo(URL_PATH_DEPRECATED)).willReturn(
                aResponse().withHeader("Content-Type", "application/json").withStatus(200)
                    .withBody(createResponseString())
            )
        )

        val measuresApiDatasource = SonarMeasuresAPIDatasource("", createBaseUrl(), Version(6, 5))
        val components = measuresApiDatasource.getComponentMap(PROJECT_KEY, listOf("coverage"))

        assertEquals(components.componentList.count(), 34)
    }

    companion object {
        private const val USERNAME = "somename"
        private const val PROJECT_KEY = "someProject"
        private val GSON = GsonBuilder().create()
        private const val URL_PATH =
            "/api/measures/component_tree?component=$PROJECT_KEY&qualifiers=FIL,UTS&metricKeys=coverage&p=1&ps=$PAGE_SIZE"
        private const val URL_PATH_SECOND_PAGE =
            "/api/measures/component_tree?component=$PROJECT_KEY&qualifiers=FIL,UTS&metricKeys=coverage&p=2&ps=$PAGE_SIZE"
        private const val URL_PATH_THIRD_PAGE =
            "/api/measures/component_tree?component=$PROJECT_KEY&qualifiers=FIL,UTS&metricKeys=coverage&p=3&ps=$PAGE_SIZE"
        private const val URL_PATH_DEPRECATED =
            "/api/measures/component_tree?baseComponentKey=$PROJECT_KEY&qualifiers=FIL,UTS&metricKeys=coverage&p=1&ps=$PAGE_SIZE"

        private fun createBaseUrl(): URL {
            try {
                return URL("http://localhost:$PORT")
            } catch (e: MalformedURLException) {
                throw RuntimeException(e)
            }
        }
    }
}
