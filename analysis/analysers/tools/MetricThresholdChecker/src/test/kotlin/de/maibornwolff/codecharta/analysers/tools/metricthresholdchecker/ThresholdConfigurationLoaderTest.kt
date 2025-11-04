package de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker

import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import java.io.File

class ThresholdConfigurationLoaderTest {
    private val resourcePath = "src/test/resources"

    @Test
    fun `should load valid JSON configuration`() {
        // Arrange
        val configFile = File("$resourcePath/valid-config.json")

        // Act
        val config = ThresholdConfigurationLoader.load(configFile)

        // Assert
        assertThat(config.fileMetrics).hasSize(2)
        assertThat(config.fileMetrics["rloc"]).isNotNull
        assertThat(config.fileMetrics["rloc"]?.max).isEqualTo(500)
        assertThat(config.fileMetrics["mcc"]?.min).isEqualTo(10)
        assertThat(config.fileMetrics["mcc"]?.max).isEqualTo(100)
    }

    @Test
    fun `should load valid YAML configuration with yml extension`() {
        // Arrange
        val configFile = File("$resourcePath/valid-config.yml")

        // Act
        val config = ThresholdConfigurationLoader.load(configFile)

        // Assert
        assertThat(config.fileMetrics).hasSize(2)
        assertThat(config.fileMetrics["rloc"]).isNotNull
        assertThat(config.fileMetrics["rloc"]?.max).isEqualTo(500)
    }

    @Test
    fun `should load valid YAML configuration with yaml extension`() {
        // Arrange
        val configFile = File("$resourcePath/valid-config.yaml")

        // Act
        val config = ThresholdConfigurationLoader.load(configFile)

        // Assert
        assertThat(config.fileMetrics).hasSize(1)
        assertThat(config.fileMetrics["complexity"]).isNotNull
        assertThat(config.fileMetrics["complexity"]?.max).isEqualTo(50)
    }

    @Test
    fun `should load configuration with only min thresholds`() {
        // Arrange
        val configFile = File("$resourcePath/only-min.json")

        // Act
        val config = ThresholdConfigurationLoader.load(configFile)

        // Assert
        assertThat(config.fileMetrics).hasSize(1)
        assertThat(config.fileMetrics["coverage"]?.min).isEqualTo(80)
        assertThat(config.fileMetrics["coverage"]?.max).isNull()
    }

    @Test
    fun `should load configuration with empty metrics map`() {
        // Arrange
        val configFile = File("$resourcePath/empty-metrics.json")

        // Act
        val config = ThresholdConfigurationLoader.load(configFile)

        // Assert
        assertThat(config.fileMetrics).isEmpty()
    }

    @Test
    fun `should load configuration with decimal thresholds`() {
        // Arrange
        val configFile = File("$resourcePath/decimal-thresholds.json")

        // Act
        val config = ThresholdConfigurationLoader.load(configFile)

        // Assert
        assertThat(config.fileMetrics["coverage"]?.min).isEqualTo(75.5)
        assertThat(config.fileMetrics["coverage"]?.max).isEqualTo(95.9)
    }

    @Test
    fun `should throw exception for unsupported file extension`() {
        // Arrange
        val configFile = File("$resourcePath/config.txt")

        // Act & Assert
        assertThatThrownBy {
            ThresholdConfigurationLoader.load(configFile)
        }.isInstanceOf(IllegalArgumentException::class.java)
            .hasMessageContaining("Unsupported configuration file format: txt")
            .hasMessageContaining("Supported formats: json, yml, yaml")
    }

    @Test
    fun `should throw exception for non-existent file`() {
        // Arrange
        val configFile = File("$resourcePath/does-not-exist.json")

        // Act & Assert
        assertThatThrownBy {
            ThresholdConfigurationLoader.load(configFile)
        }.isInstanceOf(Exception::class.java)
    }

    @Test
    fun `should throw exception for invalid JSON syntax`() {
        // Arrange
        val configFile = File("$resourcePath/invalid-json.json")

        // Act & Assert
        assertThatThrownBy {
            ThresholdConfigurationLoader.load(configFile)
        }.isInstanceOf(Exception::class.java)
    }

    @Test
    fun `should throw exception for invalid YAML syntax`() {
        // Arrange
        val configFile = File("$resourcePath/invalid-yaml.yml")

        // Act & Assert
        assertThatThrownBy {
            ThresholdConfigurationLoader.load(configFile)
        }.isInstanceOf(Exception::class.java)
    }

    @Test
    fun `should throw exception when threshold has neither min nor max`() {
        // Arrange
        val configFile = File("$resourcePath/neither-min-nor-max.json")

        // Act & Assert
        assertThatThrownBy {
            ThresholdConfigurationLoader.load(configFile)
        }.isInstanceOf(IllegalArgumentException::class.java)
            .hasMessageContaining("At least one of 'min' or 'max' must be specified")
    }

    @Test
    fun `should throw exception for non-numeric threshold values`() {
        // Arrange
        val configFile = File("$resourcePath/non-numeric-values.json")

        // Act & Assert
        assertThatThrownBy {
            ThresholdConfigurationLoader.load(configFile)
        }.isInstanceOf(Exception::class.java)
    }

    @Test
    fun `should handle missing file_metrics key with empty map`() {
        // Arrange
        val configFile = File("$resourcePath/missing-file-metrics.json")

        // Act
        val config = ThresholdConfigurationLoader.load(configFile)

        // Assert
        assertThat(config.fileMetrics).isEmpty()
    }

    @Test
    fun `should be case-insensitive for file extensions`() {
        // Arrange
        val jsonFile = File("test.JSON")
        val ymlFile = File("test.YML")
        val yamlFile = File("test.YAML")

        // Act & Assert - just verify no exception is thrown for extension matching
        // (These files don't exist, so will fail on file read, not extension check)
        assertThatThrownBy {
            ThresholdConfigurationLoader.load(jsonFile)
        }.isInstanceOf(Exception::class.java)
            .hasMessageNotContaining("Unsupported configuration file format")
    }
}
