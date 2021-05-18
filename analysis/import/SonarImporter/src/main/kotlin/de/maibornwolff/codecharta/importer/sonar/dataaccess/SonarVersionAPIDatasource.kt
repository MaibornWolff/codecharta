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
            .request(MediaType.APPLICATION_JSON + "; charset=utf-8")

        if (user.isNotEmpty()) {
            request.header("Authorization", "Basic " + AuthentificationHandler.createAuthTxtBase64Encoded(user))
        }

        try {
            System.err.print("Fetching SonarQube Version...")
            val version = request.get(String::class.java)
            return Version.parse(version)
        } catch (e: RuntimeException) {
            throw SonarImporterException("Error requesting $versionAPIRequestURI", e)
        }
    }

    companion object {
        private const val VERSION_URL_PATTERN = "%s/api/server/version"
    }
}
