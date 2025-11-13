package de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.config

import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory
import com.fasterxml.jackson.module.kotlin.KotlinModule
import com.fasterxml.jackson.module.kotlin.readValue
import de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.model.MetricThreshold
import de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.model.ThresholdConfiguration
import java.io.File

object ThresholdConfigurationLoader {
    private val jsonMapper = createMapper()
    private val yamlMapper = createMapper(YAMLFactory())

    private fun createMapper(factory: Any? = null): ObjectMapper {
        val mapper = if (factory != null) {
            ObjectMapper(factory as YAMLFactory)
        } else {
            ObjectMapper()
        }
        return mapper
            .registerModule(KotlinModule.Builder().build())
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
    }

    fun load(configFile: File): ThresholdConfiguration {
        val mapper = selectMapper(configFile)
        val configDTO = mapper.readValue<ConfigurationDTO>(configFile)
        return configDTO.toThresholdConfiguration()
    }

    private fun selectMapper(configFile: File): ObjectMapper {
        return when {
            configFile.extension.equals("json", ignoreCase = true) -> jsonMapper
            configFile.extension.equals("yml", ignoreCase = true) ||
                configFile.extension.equals("yaml", ignoreCase = true) -> yamlMapper
            else -> throw IllegalArgumentException(
                "Unsupported configuration file format: ${configFile.extension}. " +
                    "Supported formats: json, yml, yaml"
            )
        }
    }

    private data class ConfigurationDTO(
        @JsonProperty("file_metrics")
        val fileMetrics: Map<String, MetricThresholdDTO> = emptyMap()
    ) {
        fun toThresholdConfiguration(): ThresholdConfiguration {
            return ThresholdConfiguration(
                fileMetrics = fileMetrics.mapValues { (_, dto) -> dto.toMetricThreshold() }
            )
        }
    }

    private data class MetricThresholdDTO(
        val min: Number? = null,
        val max: Number? = null
    ) {
        fun toMetricThreshold(): MetricThreshold {
            return MetricThreshold(min = min, max = max)
        }
    }
}
