package de.maibornwolff.codecharta.analysers.parsers.rawtext

import io.mockk.unmockkAll
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import java.io.File

class ProjectMetricsCollectorTest {
    private val defaultExclude = listOf<String>()
    private val defaultFileExtensions = listOf<String>()
    private val defaultMetricNames = listOf<String>()
    private val defaultVerbose = false
    private val defaultMaxIndentLvl = RawTextParser.DEFAULT_INDENT_LVL
    private val defaultTabWidth = RawTextParser.DEFAULT_TAB_WIDTH

    @AfterEach
    fun afterTest() {
        unmockkAll()
    }

    @Test
    fun `Should correctly collect information when given a single file as input`() {
        // when
        val projectMetrics =
            ProjectMetricsCollector(
                File("src/test/resources/sampleproject/tabs.included").absoluteFile,
                defaultExclude,
                defaultFileExtensions,
                defaultMetricNames,
                defaultVerbose,
                defaultMaxIndentLvl,
                defaultTabWidth
            ).parseProject()

        // then
        Assertions.assertThat(projectMetrics.metricsMap.size).isEqualTo(1)
        Assertions.assertThat(projectMetrics.metricsMap).containsKey("/tabs.included")
        Assertions.assertThat(projectMetrics.metricsMap["/tabs.included"]?.metricsMap).isNotEmpty
    }

    @Test
    fun `Should correctly collect information about all files when a folder was given as input`() {
        // when
        val projectMetrics =
            ProjectMetricsCollector(
                File("src/test/resources/sampleproject").absoluteFile,
                defaultExclude,
                defaultFileExtensions,
                defaultMetricNames,
                defaultVerbose,
                defaultMaxIndentLvl,
                defaultTabWidth
            ).parseProject()

        // then
        Assertions.assertThat(projectMetrics.metricsMap.size).isEqualTo(5)
        Assertions.assertThat(projectMetrics.metricsMap).containsKey("/tabs.included")
        Assertions.assertThat(projectMetrics.metricsMap).containsKey("/spaces/spaces_3.included")
        Assertions.assertThat(projectMetrics.metricsMap["/tabs.included"]?.metricsMap).isNotEmpty
    }

    @Test
    fun `Should not include folders (only files) when given a folder as input`() {
        // when
        val projectMetrics =
            ProjectMetricsCollector(
                File("src/test/resources/sampleproject").absoluteFile,
                defaultExclude,
                defaultFileExtensions,
                defaultMetricNames,
                defaultVerbose,
                defaultMaxIndentLvl,
                defaultTabWidth
            ).parseProject()

        // then
        Assertions.assertThat(projectMetrics.metricsMap).doesNotContainKey("/spaces")
    }

    @Test
    fun `Should exclude matching files when regex patterns were given`() {
        // when
        val projectMetrics =
            ProjectMetricsCollector(
                File("src/test/resources/sampleproject").absoluteFile,
                exclude = listOf(".*\\.excluded$", "foobar"),
                defaultFileExtensions,
                defaultMetricNames,
                defaultVerbose,
                defaultMaxIndentLvl,
                defaultTabWidth
            ).parseProject()

        // then
        Assertions.assertThat(projectMetrics.metricsMap.size).isEqualTo(4)
        Assertions.assertThat(projectMetrics.metricsMap).containsKey("/spaces/spaces_3.included")
        Assertions.assertThat(projectMetrics.metricsMap).containsKey("/spaces/spaces_5.includedtoo")
        Assertions.assertThat(projectMetrics.metricsMap).doesNotContainKey("/spaces/spaces_x_not_included.excluded")
    }

    @Test
    fun `Should only include file extensions when they were specified`() {
        // when
        val projectMetrics =
            ProjectMetricsCollector(
                File("src/test/resources/sampleproject").absoluteFile,
                defaultExclude,
                fileExtensions = listOf("includedtoo"),
                defaultMetricNames,
                defaultVerbose,
                defaultMaxIndentLvl,
                defaultTabWidth
            ).parseProject()

        // then
        Assertions.assertThat(projectMetrics.metricsMap.size).isEqualTo(1)
        Assertions.assertThat(projectMetrics.metricsMap).containsKey("/spaces/spaces_5.includedtoo")
        Assertions.assertThat(projectMetrics.metricsMap).doesNotContainKey("/spaces/spaces_3.included")
        Assertions.assertThat(projectMetrics.metricsMap).doesNotContainKey("tabs.included")
    }

    @Test
    fun `Should include only specified file extensions when multiple are given`() {
        // when
        val projectMetrics =
            ProjectMetricsCollector(
                File("src/test/resources/sampleproject").absoluteFile,
                defaultExclude,
                fileExtensions = listOf("included", "includedtoo"),
                defaultMetricNames,
                defaultVerbose,
                defaultMaxIndentLvl,
                defaultTabWidth
            ).parseProject()

        // then
        Assertions.assertThat(projectMetrics.metricsMap.size).isEqualTo(4)
        Assertions.assertThat(projectMetrics.metricsMap).containsKey("/spaces/spaces_3.included")
        Assertions.assertThat(projectMetrics.metricsMap).containsKey("/spaces/spaces_4.included")
        Assertions.assertThat(projectMetrics.metricsMap).containsKey("/spaces/spaces_5.includedtoo")
        Assertions.assertThat(projectMetrics.metricsMap).doesNotContainKey("/spaces/spaces_x_not_included.excluded")
    }

    @Test
    fun `Should produce empty result when no valid file extensions were given`() {
        // when
        val projectMetrics =
            ProjectMetricsCollector(
                File("src/test/resources/sampleproject").absoluteFile,
                defaultExclude,
                fileExtensions = listOf("none"),
                defaultMetricNames,
                defaultVerbose,
                defaultMaxIndentLvl,
                defaultTabWidth
            ).parseProject()

        // then
        Assertions.assertThat(projectMetrics.metricsMap.size).isEqualTo(0)
    }

    @Test
    fun `Should produce the same result whether the user included a dot in the filetype or not`() {
        // when
        val resultWithoutDot =
            ProjectMetricsCollector(
                File("src/test/resources/sampleproject").absoluteFile,
                defaultExclude,
                fileExtensions = listOf("included", "includedtoo"),
                defaultMetricNames,
                defaultVerbose,
                defaultMaxIndentLvl,
                defaultTabWidth
            ).parseProject()
        val resultWithDot =
            ProjectMetricsCollector(
                File("src/test/resources/sampleproject").absoluteFile,
                defaultExclude,
                fileExtensions = listOf(".included", ".includedtoo"),
                defaultMetricNames,
                defaultVerbose,
                defaultMaxIndentLvl,
                defaultTabWidth
            ).parseProject()

        // then
        Assertions.assertThat(resultWithoutDot == resultWithDot)
    }

    @Test
    fun `Should produce output with empty attributes when given invalid metrics only`() {
        // given
        val inputPath = "src/test/resources/sampleproject"
        val inputFile = File(inputPath)
        val invalidMetricName = "invalidMetric"
        val metricNames = listOf(invalidMetricName)

        // when
        val projectMetrics =
            ProjectMetricsCollector(
                inputFile,
                defaultExclude,
                defaultFileExtensions,
                metricNames,
                defaultVerbose,
                defaultMaxIndentLvl,
                defaultTabWidth
            ).parseProject()

        // then
        Assertions.assertThat(projectMetrics.metricsMap.values.stream().allMatch { it.isEmpty() }).isTrue()
    }
}
