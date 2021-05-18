package de.maibornwolff.codecharta.importer.sonar.dataaccess

import de.maibornwolff.codecharta.importer.sonar.SonarImporterException
import de.maibornwolff.codecharta.importer.sonar.filter.ErrorResponseFilter
import de.maibornwolff.codecharta.importer.sonar.model.Version
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

        val request = client
            .target(versionAPIRequestURI)
            .request(MediaType.TEXT_PLAIN + "; charset=utf-8")

        if (user.isNotEmpty()) {
            request.header("Authorization", "Basic " + AuthentificationHandler.createAuthTxtBase64Encoded(user))
        }

        return try {
            System.err.println("Fetching SonarQube Version...")
            val version = request.get(String::class.java)
            Version.parse(version)
        } catch (exception: Exception) {
            when (exception) {
                is SonarImporterException -> {
                    System.err.println("Falling back to SonarQube version $DEFAULT_VERSION")
                    DEFAULT_VERSION
                }
                else -> throw SonarImporterException("Error requesting $versionAPIRequestURI")
            }
        }
    }

    companion object {
        private const val VERSION_URL_PATTERN = "%s/api/server/version"
        val DEFAULT_VERSION = Version(6, 5)
    }
}
