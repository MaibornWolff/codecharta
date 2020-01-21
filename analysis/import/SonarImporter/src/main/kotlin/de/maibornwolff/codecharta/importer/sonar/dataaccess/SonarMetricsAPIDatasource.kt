package de.maibornwolff.codecharta.importer.sonar.dataaccess

import de.maibornwolff.codecharta.importer.sonar.SonarImporterException
import de.maibornwolff.codecharta.importer.sonar.filter.ErrorResponseFilter
import de.maibornwolff.codecharta.importer.sonar.model.Metrics
import io.reactivex.Flowable
import io.reactivex.schedulers.Schedulers
import mu.KotlinLogging
import org.glassfish.jersey.client.ClientProperties
import java.net.URL
import javax.ws.rs.client.Client
import javax.ws.rs.client.ClientBuilder
import javax.ws.rs.core.MediaType

/**
 * Requests Data from Sonar Instance through REST-API
 */
class SonarMetricsAPIDatasource(private val user: String, private val baseUrl: URL?) {

    private val METRICS_URL_PATTERN = "%s/api/metrics/search?f=hidden,decimalScale&p=%s&ps=$PAGE_SIZE"
    private val TIMEOUT_MS = 5000
    private val logger = KotlinLogging.logger {}

    private val client: Client

    val availableMetricKeys: List<String>
        get() {
            val noPages = numberOfPages

            return Flowable.range(1, noPages)
                    .flatMap { p ->
                        Flowable.just(p)
                                .subscribeOn(Schedulers.io())
                                .map<Metrics>({ this.getAvailableMetrics(it) })
                    }
                    .filter { it.metrics != null }
                    .flatMap { Flowable.fromIterable(it.metrics!!) }
                    .filter({ it.isFloatType })
                    .map<String>({ it.key }).distinct().toSortedList().blockingGet()
        }

    val numberOfPages: Int
        get() {
            val response = getAvailableMetrics(1)
            return calculateNumberOfPages(response.total)
        }

    fun calculateNumberOfPages(total: Int): Int {
        var incrementor = 0
        if (total % PAGE_SIZE > 0) {
            incrementor = 1
        }
        return total / PAGE_SIZE + incrementor
    }

    internal constructor(baseUrl: URL): this("", baseUrl)

    init {

        client = ClientBuilder.newClient()
                .property(ClientProperties.CONNECT_TIMEOUT, TIMEOUT_MS)
                .property(ClientProperties.READ_TIMEOUT, TIMEOUT_MS)
        client.register(ErrorResponseFilter::class.java)
        client.register(GsonProvider::class.java)
    }

    fun getAvailableMetrics(page: Int): Metrics {
        val url = String.format(METRICS_URL_PATTERN, baseUrl, page)
        val request = client.target(url)
                .request(MediaType.APPLICATION_JSON + "; charset=utf-8")
        if (!user.isEmpty()) {
            request.header("Authorization", "Basic " + AuthentificationHandler.createAuthTxtBase64Encoded(user))
        }

        try {
            logger.debug { "Getting measures from $url" }

            return request.get(Metrics::class.java)
        } catch (e: RuntimeException) {
            throw SonarImporterException("Error requesting $url", e)
        }
    }

    companion object {
        internal const val PAGE_SIZE = 500
    }
}
