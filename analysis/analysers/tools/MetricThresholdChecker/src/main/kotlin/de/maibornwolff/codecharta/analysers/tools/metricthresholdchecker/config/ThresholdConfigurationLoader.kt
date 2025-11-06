package de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.config

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory
import com.fasterxml.jackson.module.kotlin.KotlinModule
import com.fasterxml.jackson.module.kotlin.readValue
import de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.model.MetricThreshold
import de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.model.ThresholdConfiguration
import java.io.File

object ThresholdConfigurationLoader {
    private val jsonMapper = ObjectMapper().registerModule(KotlinModule.Builder().build())
    private val yamlMapper = ObjectMapper(YAMLFactory()).registerModule(KotlinModule.Builder().build())

    fun load(configFile: File): ThresholdConfiguration {
        val mapper = when {
            configFile.extension.equals("json", ignoreCase = true) -> jsonMapper
            configFile.extension.equals("yml", ignoreCase = true) ||
                configFile.extension.equals("yaml", ignoreCase = true) -> yamlMapper
            else -> throw IllegalArgumentException(
                "Unsupported configuration file format: ${configFile.extension}. " +
                    "Supported formats: json, yml, yaml"
            )
        }

        return parseConfiguration(mapper.readValue(configFile))
    }

    @Suppress("UNCHECKED_CAST")
    private fun parseConfiguration(configMap: Map<String, Any>): ThresholdConfiguration {
        val fileMetricsMap = configMap["file_metrics"] as? Map<String, Any> ?: emptyMap()

        val fileMetrics = parseMetricThresholds(fileMetricsMap)

        return ThresholdConfiguration(
            fileMetrics = fileMetrics
        )
    }

    @Suppress("UNCHECKED_CAST")
    private fun parseMetricThresholds(metricsMap: Map<String, Any>): Map<String, MetricThreshold> {
        val result = mutableMapOf<String, MetricThreshold>()

        for ((metricName, thresholdData) in metricsMap) {
            val thresholdMap = thresholdData as? Map<String, Any>
                ?: throw IllegalArgumentException("Invalid threshold format for metric: $metricName")

            val min = thresholdMap["min"] as? Number
            val max = thresholdMap["max"] as? Number

            result[metricName] = MetricThreshold(min = min, max = max)
        }

        return result
    }
}
