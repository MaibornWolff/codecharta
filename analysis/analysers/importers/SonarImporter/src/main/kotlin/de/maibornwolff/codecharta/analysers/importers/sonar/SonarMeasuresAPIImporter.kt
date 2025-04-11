package de.maibornwolff.codecharta.analysers.importers.sonar

import de.maibornwolff.codecharta.analysers.importers.sonar.dataaccess.SonarMeasuresAPIDatasource
import de.maibornwolff.codecharta.analysers.importers.sonar.dataaccess.SonarMetricsAPIDatasource
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.translator.MetricNameTranslator
import de.maibornwolff.codecharta.util.Logger

class SonarMeasuresAPIImporter
    @JvmOverloads
    constructor(
        private val measuresDS: SonarMeasuresAPIDatasource?,
        private val metricsDS: SonarMetricsAPIDatasource?,
        private val sonarCodeURLLinker: SonarCodeURLLinker = SonarCodeURLLinker.NULL,
        private val translator: MetricNameTranslator = MetricNameTranslator.TRIVIAL,
        private val usePath: Boolean = false
    ) {
        fun getProjectFromMeasureAPI(projectKey: String, metrics: List<String>): Project {
            val metricsList = getMetricList(metrics)
            Logger.info { "Get values for metrics $metricsList." }

            val componentMap = measuresDS!!.getComponentMap(projectKey, metricsList)

            val projectBuilder = SonarComponentProjectBuilder(sonarCodeURLLinker, translator, usePath)
            val attributeDescriptors = getAttributeDescriptors()
            projectBuilder.addAttributeDescriptions(
                attributeDescriptors.filter { it.key in metricsList }.map { translator.translate(it.key) to it.value }
                    .toMap()
            )
            return projectBuilder.addComponentMapsAsNodes(componentMap).build()
        }

        fun getMetricList(metrics: List<String>): List<String> {
            return metrics.ifEmpty {
                metricsDS!!.availableMetricKeys
            }
        }
    }
