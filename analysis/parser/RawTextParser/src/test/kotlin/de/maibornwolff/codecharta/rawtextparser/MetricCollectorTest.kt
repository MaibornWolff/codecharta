package de.maibornwolff.codecharta.rawtextparser

import de.maibornwolff.codecharta.parser.rawtextparser.MetricCollector
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import java.io.File

class MetricCollectorTest {
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
    fun `Should exclude regex patterns`() {
        val result = MetricCollector(File("src/test/resources/sampleproject").absoluteFile, exclude = arrayOf(".*\\.xyz", "foobar")).parse()

        Assertions.assertThat(result.size).isEqualTo(1)
        Assertions.assertThat(result).containsKey("/spaces/spaces_xyz.wrong")
    }

    @Test
    fun `Should include only specified File extension with one given`() {
        val result = MetricCollector(File("src/test/resources/sampleproject").absoluteFile, fileExtensions = arrayOf("wrong")).parse()

        Assertions.assertThat(result.size).isEqualTo(1)
        Assertions.assertThat(result).containsKey("/spaces/spaces_xyz.wrong")
        Assertions.assertThat(result).doesNotContainKey("/spaces/spaces_3.xyz")
        Assertions.assertThat(result).doesNotContainKey("tabs.xyz")
    }

    @Test
    fun `Should include only specified File extensions with multiple given`() {
        val result = MetricCollector(File("src/test/resources/sampleproject").absoluteFile, fileExtensions = arrayOf("wrong", "xyz")).parse()

        Assertions.assertThat(result.size).isEqualTo(4)
        Assertions.assertThat(result).containsKey("/spaces/spaces_xyz.wrong")
        Assertions.assertThat(result).containsKey("/spaces/spaces_3.xyz")
        Assertions.assertThat(result).doesNotContainKey("/spaces/spaces_5.abc")
    }

    @Test
    fun `Should include all Files when no specific extensions were given (default for interactive mode)`() {
        val result = MetricCollector(File("src/test/resources/sampleproject").absoluteFile, fileExtensions = arrayOf("")).parse()

        Assertions.assertThat(result.size).isEqualTo(4)
        Assertions.assertThat(result).containsKey("/spaces/spaces_xyz.wrong")
        Assertions.assertThat(result).containsKey("/spaces/spaces_3.xyz")
        Assertions.assertThat(result).containsKey("/spaces/spaces_4.xyz")
        Assertions.assertThat(result).containsKey("/tabs.xyz")
    }

    @Test
    fun `Should not produce an output and notify the user if the only specified extension was not found in the folder`() {
        val result = MetricCollector(File("src/test/resources/sampleproject").absoluteFile, fileExtensions = arrayOf("wrong, abc")).parse()

        Assertions.assertThat(result.size).isEqualTo(0)
    }

    @Test
    fun `Should warn the user if one of the specified extensions was not found in the folder`() {

    }
}
