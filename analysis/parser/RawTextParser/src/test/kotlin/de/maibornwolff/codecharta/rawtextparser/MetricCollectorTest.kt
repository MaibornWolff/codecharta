package de.maibornwolff.codecharta.rawtextparser

import de.maibornwolff.codecharta.parser.rawtextparser.MetricCollector
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import java.io.File

class MetricCollectorTest {
    @Test
    fun `Should collect information about a single file`() {
        val result = MetricCollector(File("src/test/resources/sampleproject/tabs.included").absoluteFile).parse()

        Assertions.assertThat(result.size).isEqualTo(1)
        Assertions.assertThat(result).containsKey("/tabs.included")
        Assertions.assertThat(result["/tabs.included"]?.metricMap).isNotEmpty
    }

    @Test
    fun `Should collect information about all files within a project`() {
        val result = MetricCollector(File("src/test/resources/sampleproject").absoluteFile).parse()

        Assertions.assertThat(result.size).isEqualTo(5)
        Assertions.assertThat(result).containsKey("/tabs.included")
        Assertions.assertThat(result).containsKey("/spaces/spaces_3.included")
        Assertions.assertThat(result["/tabs.included"]?.metricMap).isNotEmpty
    }

    @Test
    fun `Should not process subfolders of projects`() {
        val result = MetricCollector(File("src/test/resources/sampleproject").absoluteFile).parse()

        Assertions.assertThat(result).doesNotContainKey("/spaces")
    }

    @Test
    fun `Should exlude regex patterns`() {
        val result = MetricCollector(File("src/test/resources/sampleproject").absoluteFile, exclude = listOf(".*\\.excluded$", "foobar")).parse()

        Assertions.assertThat(result.size).isEqualTo(4)
        Assertions.assertThat(result).containsKey("/spaces/spaces_3.included")
        Assertions.assertThat(result).containsKey("/spaces/spaces_5.includedtoo")
        Assertions.assertThat(result).doesNotContainKey("/spaces/spaces_x_not_included.excluded")
    }

    @Test
    fun `Should include only spedified File extensions`() {
        val result = MetricCollector(File("src/test/resources/sampleproject").absoluteFile, fileExtensions = listOf("includedtoo")).parse()

        Assertions.assertThat(result.size).isEqualTo(1)
        Assertions.assertThat(result).containsKey("/spaces/spaces_5.includedtoo")
        Assertions.assertThat(result).doesNotContainKey("/spaces/spaces_3.included")
        Assertions.assertThat(result).doesNotContainKey("tabs.included")
    }

    @Test
    fun `Should include only specified File extensions with multiple given`() {
        val result = MetricCollector(File("src/test/resources/sampleproject").absoluteFile, fileExtensions = listOf("included", "includedtoo")).parse()

        Assertions.assertThat(result.size).isEqualTo(4)
        Assertions.assertThat(result).containsKey("/spaces/spaces_3.included")
        Assertions.assertThat(result).containsKey("/spaces/spaces_4.included")
        Assertions.assertThat(result).containsKey("/spaces/spaces_5.includedtoo")
        Assertions.assertThat(result).doesNotContainKey("/spaces/spaces_x_not_included.excluded")
    }

    @Test
    fun `Should include all Files when no specific extensions were given (default for interactive mode)`() {
        val result = MetricCollector(File("src/test/resources/sampleproject").absoluteFile, fileExtensions = listOf("")).parse()

        Assertions.assertThat(result.size).isEqualTo(5)
        Assertions.assertThat(result).containsKey("/spaces/spaces_x_not_included.excluded")
        Assertions.assertThat(result).containsKey("/spaces/spaces_3.included")
        Assertions.assertThat(result).containsKey("/spaces/spaces_4.included")
        Assertions.assertThat(result).containsKey("/spaces/spaces_5.includedtoo")
        Assertions.assertThat(result).containsKey("/tabs.included")
    }

    @Test
    fun `Should produce empty result if no valid file extensions were given`() {
        val result = MetricCollector(File("src/test/resources/sampleproject").absoluteFile, fileExtensions = listOf("none")).parse()
        Assertions.assertThat(result.size).isEqualTo(0)
    }

    @Test
    fun `Should produce the same result whether the user included a dot in the filetype or not`() {
        val resultWithoutDot = MetricCollector(File("src/test/resources/sampleproject").absoluteFile, fileExtensions = listOf("included", "includedtoo")).parse()
        val resultWithDot = MetricCollector(File("src/test/resources/sampleproject").absoluteFile, fileExtensions = listOf(".included", ".includedtoo")).parse()

        Assertions.assertThat(resultWithoutDot == resultWithDot)
    }
}
