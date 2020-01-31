package de.maibornwolff.codecharta.importer.sonar.dataaccess

import de.maibornwolff.codecharta.importer.sonar.SonarImporterException
import de.maibornwolff.codecharta.importer.sonar.filter.ErrorResponseFilter
import de.maibornwolff.codecharta.importer.sonar.model.Component
import de.maibornwolff.codecharta.importer.sonar.model.ComponentMap
import de.maibornwolff.codecharta.importer.sonar.model.Measures
import de.maibornwolff.codecharta.importer.sonar.model.Qualifier
import io.reactivex.BackpressureStrategy
import io.reactivex.Flowable
import io.reactivex.schedulers.Schedulers
import mu.KotlinLogging
import java.net.URI
import java.net.URISyntaxException
import java.net.URL
import javax.ws.rs.client.Client
import javax.ws.rs.client.ClientBuilder
import javax.ws.rs.core.MediaType

class SonarMeasuresAPIDatasource(private val user: String, private val baseUrl: URL?) {

    private val client: Client = ClientBuilder.newClient()
    private val logger = KotlinLogging.logger {}

    private var measureBatches = 0
    private var processedPages = 0

    init {
        client.register(ErrorResponseFilter::class.java)
        client.register(GsonProvider::class.java)
    }

    fun getComponentMap(componentKey: String, metricsList: List<String>): ComponentMap {
        val componentMap = ComponentMap()
        System.err.print("0% of data retrieved...")

        val flowable = Flowable.fromIterable(metricsList.windowed(MAX_METRICS_IN_ONE_SONARCALL, MAX_METRICS_IN_ONE_SONARCALL, true))
        flowable.flatMap { p ->
            measureBatches++
                    getMeasures(componentKey, p)
                            .subscribeOn(Schedulers.computation())
                }
                .blockingForEach { componentMap.updateComponent(it) }

        System.err.println()
        return componentMap
    }

    private fun getMeasures(componentKey: String, sublist: List<String>): Flowable<Component> {

        return Flowable.create({ subscriber ->
            var page = 1
            var total: Int
            do {
                val measures = getMeasuresFromPage(componentKey, sublist, page)
                total = measures.paging.total

                if (measures.components != null) {
                    measures.components
                            .filter { c -> c.qualifier == Qualifier.FIL || c.qualifier == Qualifier.UTS }
                            .forEach { subscriber.onNext(it) }
                }

                updateProgress(total)
            } while (page++ * PAGE_SIZE < total)
            subscriber.onComplete()
        }, BackpressureStrategy.BUFFER)
    }

    internal fun getMeasuresFromPage(componentKey: String, metrics: List<String>, pageNumber: Int): Measures {
        val measureAPIRequestURI = createMeasureAPIRequestURI(componentKey, metrics, pageNumber)

        val request = client
                .target(measureAPIRequestURI)
                .request(MediaType.APPLICATION_JSON + "; charset=utf-8")

        if (!user.isEmpty()) {
            request.header("Authorization", "Basic " + AuthentificationHandler.createAuthTxtBase64Encoded(user))
        }

        try {
            logger.debug { "Getting measures from $measureAPIRequestURI" }
            return request.get<Measures>(Measures::class.java)
        } catch (e: RuntimeException) {
            throw SonarImporterException("Error requesting $measureAPIRequestURI", e)
        }
    }

    internal fun createMeasureAPIRequestURI(componentKey: String, metrics: List<String>, pageNumber: Int): URI {
        if (metrics.isEmpty()) {
            throw IllegalArgumentException("Empty list of metrics is not supported.")
        }

        val metricString = metrics.joinToString(",") { it }
        try {
            return URI(String.format(MEASURES_URL_PATTERN, baseUrl, componentKey, metricString, pageNumber))
        } catch (e: URISyntaxException) {
            throw SonarImporterException(e)
        }
    }

    private fun updateProgress(componentCount: Int) {
        processedPages++
        val pagesPerRun = (componentCount + PAGE_SIZE - 1) / PAGE_SIZE
        val currentProgress = 100 * processedPages / (pagesPerRun * measureBatches)
        System.err.print("\r$currentProgress% of data retrieved...")
    }

    companion object {

        private const val PAGE_SIZE = 500
        private const val MAX_METRICS_IN_ONE_SONARCALL = 15
        private const val MEASURES_URL_PATTERN =
                "%s/api/measures/component_tree?baseComponentKey=%s&qualifiers=FIL,UTS&metricKeys=%s&p=%s&ps=$PAGE_SIZE"
    }
}
