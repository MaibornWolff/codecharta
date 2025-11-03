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
    private val testResourceBaseFolder = "src/test/resources/"

    @AfterEach
    fun afterTest() {
        unmockkAll()
    }

    @Test
    fun `Should correctly collect information when given a single file as input`() {
        // when
        val projectMetrics =
            ProjectMetricsCollector(
                File("${testResourceBaseFolder}sampleproject/tabs.included").absoluteFile,
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
                File("${testResourceBaseFolder}sampleproject").absoluteFile,
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
                File("${testResourceBaseFolder}sampleproject").absoluteFile,
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
                File("${testResourceBaseFolder}sampleproject").absoluteFile,
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
                File("${testResourceBaseFolder}sampleproject").absoluteFile,
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
                File("${testResourceBaseFolder}sampleproject").absoluteFile,
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
                File("${testResourceBaseFolder}sampleproject").absoluteFile,
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
                File("${testResourceBaseFolder}sampleproject").absoluteFile,
                defaultExclude,
                fileExtensions = listOf("included", "includedtoo"),
                defaultMetricNames,
                defaultVerbose,
                defaultMaxIndentLvl,
                defaultTabWidth
            ).parseProject()
        val resultWithDot =
            ProjectMetricsCollector(
                File("${testResourceBaseFolder}sampleproject").absoluteFile,
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
        val inputPath = "${testResourceBaseFolder}sampleproject"
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

    @Test
    fun `Should exclude files based on gitignore when useGitignore is true`() {
        // Arrange
        val testProjectPath = "${testResourceBaseFolder}gitignore-test-project"
        val testProjectDir = File(testProjectPath).absoluteFile

        // Act
        val projectMetrics =
            ProjectMetricsCollector(
                testProjectDir,
                defaultExclude,
                defaultFileExtensions,
                defaultMetricNames,
                defaultVerbose,
                defaultMaxIndentLvl,
                defaultTabWidth,
                useGitignore = true
            ).parseProject()

        // Assert
        Assertions.assertThat(projectMetrics.metricsMap).containsKey("/Main.kt")
        Assertions.assertThat(projectMetrics.metricsMap).containsKey("/NotIgnored.kt")
        Assertions.assertThat(projectMetrics.metricsMap).doesNotContainKey("/ignored.exclude")
        Assertions.assertThat(projectMetrics.metricsMap).doesNotContainKey("/excluded-dir/output.txt")
        Assertions.assertThat(projectMetrics.metricsMap).doesNotContainKey("/excluded-dir/nested/deep.txt")
    }

    @Test
    fun `Should include all files when useGitignore is false`() {
        // Arrange
        val testProjectPath = "${testResourceBaseFolder}gitignore-test-project"
        val testProjectDir = File(testProjectPath).absoluteFile

        // Act
        val projectMetrics =
            ProjectMetricsCollector(
                testProjectDir,
                defaultExclude,
                defaultFileExtensions,
                defaultMetricNames,
                defaultVerbose,
                defaultMaxIndentLvl,
                defaultTabWidth,
                useGitignore = false
            ).parseProject()

        // Assert
        Assertions.assertThat(projectMetrics.metricsMap).containsKey("/Main.kt")
        Assertions.assertThat(projectMetrics.metricsMap).containsKey("/NotIgnored.kt")
        Assertions.assertThat(projectMetrics.metricsMap).containsKey("/ignored.exclude")
    }

    @Test
    fun `Should apply both gitignore and regex exclusions when both are specified`() {
        // Arrange
        val testProjectPath = "${testResourceBaseFolder}gitignore-test-project"
        val testProjectDir = File(testProjectPath).absoluteFile
        val regexExclude = listOf(".*NotIgnored.*")

        // Act
        val projectMetrics =
            ProjectMetricsCollector(
                testProjectDir,
                regexExclude,
                defaultFileExtensions,
                defaultMetricNames,
                defaultVerbose,
                defaultMaxIndentLvl,
                defaultTabWidth,
                useGitignore = true
            ).parseProject()

        // Assert
        Assertions.assertThat(projectMetrics.metricsMap).containsKey("/Main.kt")
        Assertions.assertThat(projectMetrics.metricsMap).doesNotContainKey("/NotIgnored.kt")
        Assertions.assertThat(projectMetrics.metricsMap).doesNotContainKey("/ignored.exclude")
        Assertions.assertThat(projectMetrics.metricsMap).doesNotContainKey("/excluded-dir/output.txt")
        Assertions.assertThat(projectMetrics.metricsMap).doesNotContainKey("/excluded-dir/nested/deep.txt")
    }

    @Test
    fun `Should track gitignore statistics correctly`() {
        // Arrange
        val testProjectPath = "${testResourceBaseFolder}gitignore-test-project"
        val testProjectDir = File(testProjectPath).absoluteFile

        // Act
        val collector =
            ProjectMetricsCollector(
                testProjectDir,
                defaultExclude,
                defaultFileExtensions,
                defaultMetricNames,
                defaultVerbose,
                defaultMaxIndentLvl,
                defaultTabWidth,
                useGitignore = true
            )
        collector.parseProject()
        val (excludedCount, gitignoreFiles) = collector.getGitIgnoreStatistics()

        // Assert
        Assertions.assertThat(excludedCount).isGreaterThan(0)
        Assertions.assertThat(gitignoreFiles).isNotEmpty()
    }

    @Test
    fun `Should return empty statistics when gitignore is disabled`() {
        // Arrange
        val testProjectPath = "${testResourceBaseFolder}gitignore-test-project"
        val testProjectDir = File(testProjectPath).absoluteFile

        // Act
        val collector =
            ProjectMetricsCollector(
                testProjectDir,
                defaultExclude,
                defaultFileExtensions,
                defaultMetricNames,
                defaultVerbose,
                defaultMaxIndentLvl,
                defaultTabWidth,
                useGitignore = false
            )
        collector.parseProject()
        val (excludedCount, gitignoreFiles) = collector.getGitIgnoreStatistics()

        // Assert
        Assertions.assertThat(excludedCount).isEqualTo(0)
        Assertions.assertThat(gitignoreFiles).isEmpty()
    }

    @Test
    fun `Should handle project without gitignore file gracefully`() {
        // Arrange
        val testProjectPath = "${testResourceBaseFolder}sampleproject"
        val testProjectDir = File(testProjectPath)

        // Act
        val projectMetrics =
            ProjectMetricsCollector(
                testProjectDir,
                defaultExclude,
                defaultFileExtensions,
                defaultMetricNames,
                defaultVerbose,
                defaultMaxIndentLvl,
                defaultTabWidth,
                useGitignore = true
            ).parseProject()

        // Assert
        Assertions.assertThat(projectMetrics.metricsMap.size).isEqualTo(5)
    }
}
