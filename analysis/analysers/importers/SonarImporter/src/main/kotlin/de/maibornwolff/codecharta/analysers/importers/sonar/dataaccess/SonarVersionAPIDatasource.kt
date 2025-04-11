package de.maibornwolff.codecharta.analysers.importers.sonar.dataaccess

import de.maibornwolff.codecharta.analysers.importers.sonar.SonarImporterException
import de.maibornwolff.codecharta.analysers.importers.sonar.filter.ErrorResponseFilter
import de.maibornwolff.codecharta.analysers.importers.sonar.model.Version
import java.net.URI
import java.net.URL
import javax.ws.rs.client.Client
import javax.ws.rs.client.ClientBuilder
import javax.ws.rs.core.MediaType

class SonarVersionAPIDatasource(private val user: String, private val baseUrl: URL) {
    private val client: Client = ClientBuilder.newClient()

    init {
        client.register(ErrorResponseFilter::class.java)
        client.register(GsonProvider::class.java)
    }

    fun getSonarqubeVersion(): Version {
        val versionAPIRequestURI = URI(String.format(VERSION_URL_PATTERN, baseUrl))

        val request = client.target(versionAPIRequestURI).request(MediaType.TEXT_PLAIN + "; charset=utf-8")

        if (user.isNotEmpty()) {
            request.header("Authorization", "Basic " + AuthenticationHandler.createAuthTxtBase64Encoded(user))
        }

        val response =
            try {
                System.err.println("Fetching SonarQube Version...")
                request.get(String::class.java)
            } catch (e: RuntimeException) {
                throw SonarImporterException("Error requesting $versionAPIRequestURI", e)
            }

        return try {
            val version = Version.parse(response)
            System.err.println("Found SonarQube version ${version.major}.${version.minor}")
            version
        } catch (exception: SonarImporterException) {
            exception.printStackTrace()
            System.err.println("Falling back to SonarQube version ${DEFAULT_VERSION.major}.${DEFAULT_VERSION.minor}")
            DEFAULT_VERSION
        }
    }

    companion object {
        private const val VERSION_URL_PATTERN = "%s/api/server/version"
        val DEFAULT_VERSION = Version(8, 9)
    }
}
