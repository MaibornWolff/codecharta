package de.maibornwolff.codecharta.analysers.importers.sonar.dataaccess

import de.maibornwolff.codecharta.analysers.importers.sonar.SonarImporterException
import de.maibornwolff.codecharta.analysers.importers.sonar.filter.ErrorResponseFilter
import de.maibornwolff.codecharta.analysers.importers.sonar.model.Component
import de.maibornwolff.codecharta.analysers.importers.sonar.model.ComponentMap
import de.maibornwolff.codecharta.analysers.importers.sonar.model.Measures
import de.maibornwolff.codecharta.analysers.importers.sonar.model.Qualifier
import de.maibornwolff.codecharta.analysers.importers.sonar.model.Version
import de.maibornwolff.codecharta.progresstracker.ParsingUnit
import de.maibornwolff.codecharta.progresstracker.ProgressTracker
import de.maibornwolff.codecharta.util.Logger
import io.reactivex.BackpressureStrategy
import io.reactivex.Flowable
import io.reactivex.schedulers.Schedulers
import java.net.URI
import java.net.URISyntaxException
import java.net.URL
import javax.ws.rs.client.Client
import javax.ws.rs.client.ClientBuilder
import javax.ws.rs.core.MediaType

class SonarMeasuresAPIDatasource(
    private val user: String,
    private val baseUrl: URL,
    private val version: Version = SonarVersionAPIDatasource.DEFAULT_VERSION
) {
    private val client: Client = ClientBuilder.newClient()

    private var measureBatches = 0
    private var processedPages = 0
    private val progressTracker: ProgressTracker = ProgressTracker()
    private val parsingUnit = ParsingUnit.Files

    init {
        client.register(ErrorResponseFilter::class.java)
        client.register(GsonProvider::class.java)
    }

    fun getComponentMap(componentKey: String, metricsList: List<String>): ComponentMap {
        val componentMap = ComponentMap()
        System.err.print("0% of data retrieved...")

        val flowable =
            Flowable.fromIterable(
                metricsList.windowed(
                    MAX_METRICS_IN_ONE_SONAR_CALL,
                    MAX_METRICS_IN_ONE_SONAR_CALL,
                    true
                )
            )
        flowable.flatMap { p ->
            measureBatches++
            getMeasures(componentKey, p).subscribeOn(Schedulers.computation())
        }.blockingForEach { componentMap.updateComponent(it) }

        System.err.println()
        return componentMap
    }

    private fun getMeasures(componentKey: String, sublist: List<String>): Flowable<Component> {
        return Flowable.create(
            { subscriber ->
                var page = 1
                var total: Int
                do {
                    val measures = getMeasuresFromPage(componentKey, sublist, page)
                    total = measures.paging.total

                    if (measures.components != null) {
                        measures.components.filter { c -> c.qualifier == Qualifier.FIL || c.qualifier == Qualifier.UTS }
                            .forEach { subscriber.onNext(it) }
                    }

                    updateProgress(total)
                } while (page++ * PAGE_SIZE < total)
                subscriber.onComplete()
            },
            BackpressureStrategy.BUFFER
        )
    }

    internal fun getMeasuresFromPage(componentKey: String, metrics: List<String>, pageNumber: Int): Measures {
        val measureAPIRequestURI = createMeasureAPIRequestURI(componentKey, metrics, pageNumber)

        val request = client.target(measureAPIRequestURI).request(MediaType.APPLICATION_JSON + "; charset=utf-8")

        if (user.isNotEmpty()) {
            request.header("Authorization", "Basic " + AuthenticationHandler.createAuthTxtBase64Encoded(user))
        }

        try {
            Logger.debug { "Getting measures from $measureAPIRequestURI" }
            return request.get(Measures::class.java)
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
            val pattern =
                if (version.isSmallerThan(Version(6, 6))) MEASURES_URL_PATTERN_DEPRECATED else MEASURES_URL_PATTERN
            return URI(String.format(pattern, baseUrl, componentKey, metricString, pageNumber))
        } catch (e: URISyntaxException) {
            throw SonarImporterException(e)
        }
    }

    private fun updateProgress(componentCount: Int) {
        processedPages++
        val pagesPerRun = (componentCount + PAGE_SIZE - 1) / PAGE_SIZE
        progressTracker.updateProgress(
            (pagesPerRun * measureBatches).toLong(),
            processedPages.toLong(),
            parsingUnit.name
        )
    }

    companion object {
        private const val PAGE_SIZE = 500
        private const val MAX_METRICS_IN_ONE_SONAR_CALL = 15
        private const val MEASURES_URL_PATTERN_DEPRECATED =
            "%s/api/measures/component_tree?baseComponentKey=%s&qualifiers=FIL,UTS&metricKeys=%s&p=%s&ps=$PAGE_SIZE"
        private const val MEASURES_URL_PATTERN =
            "%s/api/measures/component_tree?component=%s&qualifiers=FIL,UTS&metricKeys=%s&p=%s&ps=$PAGE_SIZE"
    }
}
