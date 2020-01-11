package de.maibornwolff.codecharta.rawtextparser

import de.maibornwolff.codecharta.importer.rawtextparser.MetricCollector
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import java.io.File

class ProjectParserTest {
    @Test
    fun `Should collect information about a single file`() {
        val result = MetricCollector(File("src/test/resources/sampleproject/tabs.xyz").absoluteFile).parse()

        Assertions.assertThat(result.size).isEqualTo(1)
        Assertions.assertThat(result).containsKey("/tabs.xyz")
        Assertions.assertThat(result["/tabs.xyz"]?.metricMap).isNotEmpty
    }

    @Test
    fun `Should collect information about all files within a project`() {
        val result = MetricCollector(File("src/test/resources/sampleproject").absoluteFile).parse()

        Assertions.assertThat(result.size).isEqualTo(4)
        Assertions.assertThat(result).containsKey("/tabs.xyz")
        Assertions.assertThat(result).containsKey("/spaces/spaces_3.xyz")
        Assertions.assertThat(result["/tabs.xyz"]?.metricMap).isNotEmpty
    }

    @Test
    fun `Should not process subfolders of projects`() {
        val result = MetricCollector(File("src/test/resources/sampleproject").absoluteFile).parse()

        Assertions.assertThat(result).doesNotContainKey("/spaces")
    }


    @Test
    fun `Should exlude regex patterns`() {
        val result = MetricCollector(File("src/test/resources/sampleproject").absoluteFile, exclude = arrayOf(".*\\.xyz", "foobar")).parse()

        Assertions.assertThat(result.size).isEqualTo(1)
        Assertions.assertThat(result).containsKey("/spaces/spaces_xyz.wrong")
    }
}