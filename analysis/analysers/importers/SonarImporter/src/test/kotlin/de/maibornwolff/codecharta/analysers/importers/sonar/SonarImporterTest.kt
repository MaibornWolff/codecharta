package de.maibornwolff.codecharta.analysers.importers.sonar

import com.github.tomakehurst.wiremock.client.WireMock
import com.github.tomakehurst.wiremock.client.WireMock.getRequestedFor
import com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo
import com.github.tomakehurst.wiremock.client.WireMock.verify
import com.github.tomakehurst.wiremock.junit5.WireMockTest
import de.maibornwolff.codecharta.analysers.importers.sonar.dataaccess.SonarMetricsAPIDatasource
import de.maibornwolff.codecharta.util.InputHelper
import io.mockk.every
import io.mockk.mockkObject
import io.mockk.unmockkAll
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.MethodSource
import picocli.CommandLine
import java.io.ByteArrayOutputStream
import java.io.PrintStream
import javax.ws.rs.core.MediaType

private const val PORT = 8089

@WireMockTest(httpPort = PORT)
class SonarImporterTest {
    val errContent = ByteArrayOutputStream()
    val originalErr = System.err

    @AfterEach
    fun afterTest() {
        unmockkAll()
    }

    companion object {
        private const val METRIC_LIST_URL_PATH =
            "/api/metrics/search?f=hidden,decimalScale&p=1&ps=${SonarMetricsAPIDatasource.PAGE_SIZE}"

        @JvmStatic
        fun provideValidURLs(): List<Arguments> {
            return listOf(
                Arguments.of("https://thisisatesturl.com"),
                Arguments.of("http://thisisatesturl.com")
            )
        }

        @JvmStatic
        fun provideValidInputFiles(): List<Arguments> {
            return listOf(
                Arguments.of("src/test/resources/my/sonar/repo"),
                Arguments.of("src/test/resources/my/sonar"),
                Arguments.of("src/test/resources/my/sonar/repo/sonar-project.properties")
            )
        }

        @JvmStatic
        fun provideInvalidInputFiles(): List<Arguments> {
            return listOf(
                Arguments.of("src/test/resources/my/other/repo"),
                Arguments.of("src/test/resources"),
                Arguments.of("src/test/resources/my/other/sonar-project.properties"),
                Arguments.of("src/test/resources/this/does/not/exist"),
                Arguments.of("")
            )
        }

        @JvmStatic
        fun provideInvalidURLs(): List<Arguments> {
            return listOf(
                Arguments.of("thisisatesturl.https://"),
                Arguments.of("thisisatesturl.http://"),
                Arguments.of("http:/noturl.com"),
                Arguments.of("www.google.com")
            )
        }
    }

    @BeforeEach
    fun mockVersionRequest() {
        WireMock.stubFor(
            WireMock.get(urlEqualTo("/api/server/version")).willReturn(
                WireMock.aResponse().withHeader("Content-Type", MediaType.TEXT_PLAIN + "; charset=utf-8")
                    .withStatus(200).withBody("7.8.0.0")
            )
        )
    }

    @Test
    @Throws(Exception::class)
    fun `should call correct url with trailing backslash in URL parameter`() {
        WireMock.stubFor(
            WireMock.get(urlEqualTo(METRIC_LIST_URL_PATH)).willReturn(
                WireMock.aResponse().withStatus(200).withHeader("Content-Type", "application/json")
                    .withBody("{\"metrics\": [],\"total\": 0, \"p\": 0, \"ps\": 0}")
            )
        )

        CommandLine(SonarImporter()).execute(*arrayOf("http://localhost:8089/", "someproject"))

        verify(1, getRequestedFor(urlEqualTo(METRIC_LIST_URL_PATH)))
    }

    @Test
    @Throws(Exception::class)
    fun `should call correct url without trailing backslash in URL parameter`() {
        WireMock.stubFor(
            WireMock.get(urlEqualTo(METRIC_LIST_URL_PATH)).willReturn(
                WireMock.aResponse().withStatus(200).withHeader("Content-Type", "application/json")
                    .withBody("{\"metrics\": [],\"total\": 0, \"p\": 0, \"ps\": 0}")
            )
        )

        CommandLine(SonarImporter()).execute(*arrayOf("http://localhost:8089", "someproject"))

        verify(1, getRequestedFor(urlEqualTo(METRIC_LIST_URL_PATH)))
    }

    @ParameterizedTest
    @MethodSource("provideValidURLs")
    fun `should be identified as applicable for given directory path being an url`(resourceToBeParsed: String) {
        val isApplicable = SonarImporter().isApplicable(resourceToBeParsed)
        Assertions.assertTrue(isApplicable)
    }

    @ParameterizedTest
    @MethodSource("provideValidInputFiles")
    fun `should be identified as applicable for given directory path containing a sonar properties file`(resourceToBeParsed: String) {
        val isApplicable = SonarImporter().isApplicable(resourceToBeParsed)
        Assertions.assertTrue(isApplicable)
    }

    @ParameterizedTest
    @MethodSource("provideInvalidInputFiles")
    fun `should NOT be identified as applicable if no sonar properties file is present at given path`(resourceToBeParsed: String) {
        val isApplicable = SonarImporter().isApplicable(resourceToBeParsed)
        Assertions.assertFalse(isApplicable)
    }

    @ParameterizedTest
    @MethodSource("provideInvalidURLs")
    fun `should NOT be identified as applicable for given broken url`(resourceToBeParsed: String) {
        val isApplicable = SonarImporter().isApplicable(resourceToBeParsed)
        Assertions.assertFalse(isApplicable)
    }

    @Test
    fun `should stop execution if url is empty string`() {
        mockkObject(InputHelper)
        every {
            InputHelper.isInputValid(any(), any())
        } returns false

        System.setErr(PrintStream(errContent))
        CommandLine(SonarImporter()).execute(*arrayOf("", "dummyVal"))
        System.setErr(originalErr)

        Assertions.assertTrue(
            errContent.toString().contains("Input invalid Url or ProjectID for SonarImporter, stopping execution")
        )
    }

    @Test
    fun `should stop execution if project key is empty string`() {
        mockkObject(InputHelper)
        every {
            InputHelper.isInputValid(any(), any())
        } returns false

        System.setErr(PrintStream(errContent))
        CommandLine(SonarImporter()).execute(*arrayOf("dummyVal", ""))
        System.setErr(originalErr)

        Assertions.assertTrue(
            errContent.toString().contains("Input invalid Url or ProjectID for SonarImporter, stopping execution")
        )
    }

    @Test
    fun `should NOT be identified as applicable if input is a file but not the sonar properties file`() {
        val isApplicable = SonarImporter().isApplicable("src/test/resources/example.xml")
        Assertions.assertFalse(isApplicable)
    }

    @Test
    fun `should NOT be identified as applicable if input does not contain sonar properties file in first two directory levels`() {
        val isApplicable = SonarImporter().isApplicable("src/test/resources/my")
        Assertions.assertFalse(isApplicable)
    }
}
