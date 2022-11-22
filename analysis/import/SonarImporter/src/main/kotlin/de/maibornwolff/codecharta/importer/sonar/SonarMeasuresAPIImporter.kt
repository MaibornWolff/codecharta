package de.maibornwolff.codecharta.importer.sonar

import de.maibornwolff.codecharta.importer.sonar.dataaccess.SonarMeasuresAPIDatasource
import de.maibornwolff.codecharta.importer.sonar.dataaccess.SonarMetricsAPIDatasource
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.translator.MetricNameTranslator
import mu.KotlinLogging

private val logger = KotlinLogging.logger {}

class SonarMeasuresAPIImporter @JvmOverloads constructor(
    private val measuresDS: SonarMeasuresAPIDatasource?,
    private val metricsDS: SonarMetricsAPIDatasource?,
    private val sonarCodeURLLinker: SonarCodeURLLinker = SonarCodeURLLinker.NULL,
    private val translator: MetricNameTranslator = MetricNameTranslator.TRIVIAL,
    private val usePath: Boolean = false
) {

    fun getProjectFromMeasureAPI(projectKey: String, metrics: List<String>): Project {
        val metricsList = getMetricList(metrics)
        logger.info { "Get values for metrics $metricsList." }

        val componentMap = measuresDS!!.getComponentMap(projectKey, metricsList)

        val projectBuilder = SonarComponentProjectBuilder(sonarCodeURLLinker, translator, usePath)
        val attributeDescriptors = getAttributeDescriptors()
        projectBuilder.addAttributeDescriptions(
            attributeDescriptors
                .filter { it.key in metricsList }
                .map { translator.translate(it.key) to it.value }
                .toMap()
        )
        return projectBuilder.addComponentMapsAsNodes(componentMap).build()
    }

    fun getMetricList(metrics: List<String>): List<String> {
        return if (metrics.isEmpty()) {
            metricsDS!!.availableMetricKeys
        } else metrics
    }
}
