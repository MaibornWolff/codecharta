package de.maibornwolff.codecharta.rawtextparser

import de.maibornwolff.codecharta.parser.rawtextparser.MetricCollector
import de.maibornwolff.codecharta.parser.rawtextparser.RawTextParser
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import java.io.File

class MetricCollectorTest {

    private val defaultExclude = listOf<String>()
    private val defaultFileExtensions = listOf<String>()
    private val defaultMetricNames = listOf<String>()
    private val defaultVerbose = false
    private val defaultMaxIndentLvl = RawTextParser.DEFAULT_INDENT_LVL
    private val defaultTabWidth = RawTextParser.DEFAULT_TAB_WIDTH

    @Test
    fun `Should correctly collect information when given a single file as input`() {
        // when
        val result = MetricCollector(
                File("src/test/resources/sampleproject/tabs.included").absoluteFile,
                defaultExclude,
                defaultFileExtensions,
                defaultMetricNames,
                defaultVerbose,
                defaultMaxIndentLvl,
                defaultTabWidth
        ).parse()

        // then
        Assertions.assertThat(result.size).isEqualTo(1)
        Assertions.assertThat(result).containsKey("/tabs.included")
        Assertions.assertThat(result["/tabs.included"]?.metricMap).isNotEmpty
    }

    @Test
    fun `Should correctly collect information about all files when a folder was given as input`() {
        // when
        val result = MetricCollector(
                File("src/test/resources/sampleproject").absoluteFile,
                defaultExclude,
                defaultFileExtensions,
                defaultMetricNames,
                defaultVerbose,
                defaultMaxIndentLvl,
                defaultTabWidth
        ).parse()

        // then
        Assertions.assertThat(result.size).isEqualTo(5)
        Assertions.assertThat(result).containsKey("/tabs.included")
        Assertions.assertThat(result).containsKey("/spaces/spaces_3.included")
        Assertions.assertThat(result["/tabs.included"]?.metricMap).isNotEmpty
    }

    @Test
    fun `Should not include folders (only files) when given a folder as input`() {
        // when
        val result = MetricCollector(
                File("src/test/resources/sampleproject").absoluteFile,
                defaultExclude,
                defaultFileExtensions,
                defaultMetricNames,
                defaultVerbose,
                defaultMaxIndentLvl,
                defaultTabWidth
        ).parse()

        // then
        Assertions.assertThat(result).doesNotContainKey("/spaces")
    }

    @Test
    fun `Should exclude matching files when regex patterns were given`() {
        // when
        val result = MetricCollector(File("src/test/resources/sampleproject").absoluteFile,
                exclude = listOf(".*\\.excluded$", "foobar"),
                defaultFileExtensions,
                defaultMetricNames,
                defaultVerbose,
                defaultMaxIndentLvl,
                defaultTabWidth
        ).parse()

        // then
        Assertions.assertThat(result.size).isEqualTo(4)
        Assertions.assertThat(result).containsKey("/spaces/spaces_3.included")
        Assertions.assertThat(result).containsKey("/spaces/spaces_5.includedtoo")
        Assertions.assertThat(result).doesNotContainKey("/spaces/spaces_x_not_included.excluded")
    }

    @Test
    fun `Should only include file extensions when they were specified`() {
        // when
        val result = MetricCollector(File("src/test/resources/sampleproject").absoluteFile,
                defaultExclude,
                fileExtensions = listOf("includedtoo"),
                defaultMetricNames,
                defaultVerbose,
                defaultMaxIndentLvl,
                defaultTabWidth
        ).parse()

        // then
        Assertions.assertThat(result.size).isEqualTo(1)
        Assertions.assertThat(result).containsKey("/spaces/spaces_5.includedtoo")
        Assertions.assertThat(result).doesNotContainKey("/spaces/spaces_3.included")
        Assertions.assertThat(result).doesNotContainKey("tabs.included")
    }

    @Test
    fun `Should include only specified file extensions when multiple are given`() {
        // when
        val result = MetricCollector(File("src/test/resources/sampleproject").absoluteFile,
                defaultExclude,
                fileExtensions = listOf("included", "includedtoo"),
                defaultMetricNames,
                defaultVerbose,
                defaultMaxIndentLvl,
                defaultTabWidth
        ).parse()

        // then
        Assertions.assertThat(result.size).isEqualTo(4)
        Assertions.assertThat(result).containsKey("/spaces/spaces_3.included")
        Assertions.assertThat(result).containsKey("/spaces/spaces_4.included")
        Assertions.assertThat(result).containsKey("/spaces/spaces_5.includedtoo")
        Assertions.assertThat(result).doesNotContainKey("/spaces/spaces_x_not_included.excluded")
    }

    @Test
    fun `Should produce empty result when no valid file extensions were given`() {
        // when
        val result = MetricCollector(File("src/test/resources/sampleproject").absoluteFile,
                defaultExclude,
                fileExtensions = listOf("none"),
                defaultMetricNames,
                defaultVerbose,
                defaultMaxIndentLvl,
                defaultTabWidth
        ).parse()

        // then
        Assertions.assertThat(result.size).isEqualTo(0)
    }

    @Test
    fun `Should produce the same result whether the user included a dot in the filetype or not`() {
        // when
        val resultWithoutDot = MetricCollector(File("src/test/resources/sampleproject").absoluteFile,
                defaultExclude,
                fileExtensions = listOf("included", "includedtoo"),
                defaultMetricNames,
                defaultVerbose,
                defaultMaxIndentLvl,
                defaultTabWidth
        ).parse()
        val resultWithDot = MetricCollector(File("src/test/resources/sampleproject").absoluteFile,
                defaultExclude,
                fileExtensions = listOf(".included", ".includedtoo"),
                defaultMetricNames,
                defaultVerbose,
                defaultMaxIndentLvl,
                defaultTabWidth
        ).parse()

        // then
        Assertions.assertThat(resultWithoutDot == resultWithDot)
    }
}
