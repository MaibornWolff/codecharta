package de.maibornwolff.codecharta.analysers.importers.sonar.dataaccess

import de.maibornwolff.codecharta.analysers.importers.sonar.SonarImporterException
import de.maibornwolff.codecharta.analysers.importers.sonar.filter.ErrorResponseFilter
import de.maibornwolff.codecharta.analysers.importers.sonar.model.Metrics
import de.maibornwolff.codecharta.util.Logger
import io.reactivex.Flowable
import io.reactivex.schedulers.Schedulers
import org.glassfish.jersey.client.ClientProperties
import java.net.URL
import javax.ws.rs.client.Client
import javax.ws.rs.client.ClientBuilder
import javax.ws.rs.core.MediaType

/**
 * Requests Data from Sonar Instance through REST-API
 */
class SonarMetricsAPIDatasource(private val user: String, private val baseUrl: URL?) {
    private val client: Client =
        ClientBuilder.newClient().property(ClientProperties.CONNECT_TIMEOUT, Companion.TIMEOUT_MS)
            .property(ClientProperties.READ_TIMEOUT, Companion.TIMEOUT_MS)

    val availableMetricKeys: List<String>
        get() {
            val noPages = numberOfPages

            return Flowable.range(1, noPages).flatMap { p ->
                Flowable.just(p).subscribeOn(Schedulers.io()).map { this.getAvailableMetrics(it) }
            }.filter { it.metrics != null }.flatMap { Flowable.fromIterable(it.metrics!!) }.filter { it.isFloatType }
                .map { it.key }.distinct().toSortedList().blockingGet()
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

    internal constructor(baseUrl: URL) : this("", baseUrl)

    init {

        client.register(ErrorResponseFilter::class.java)
        client.register(GsonProvider::class.java)
    }

    fun getAvailableMetrics(page: Int): Metrics {
        val url = String.format(Companion.METRICS_URL_PATTERN, baseUrl, page)
        val request = client.target(url).request(MediaType.APPLICATION_JSON + "; charset=utf-8")
        if (user.isNotEmpty()) {
            request.header("Authorization", "Basic " + AuthenticationHandler.createAuthTxtBase64Encoded(user))
        }

        try {
            Logger.debug { "Getting measures from $url" }

            return request.get(Metrics::class.java)
        } catch (e: RuntimeException) {
            throw SonarImporterException("Error requesting $url", e)
        }
    }

    companion object {
        internal const val PAGE_SIZE = 500
        private const val METRICS_URL_PATTERN = "%s/api/metrics/search?f=hidden,decimalScale&p=%s&ps=$PAGE_SIZE"
        private const val TIMEOUT_MS = 5000
    }
}
