package de.maibornwolff.codecharta.importer.sourcecodeparser.e2e

import de.maibornwolff.codecharta.importer.sourcecodeparser.SourceCodeParserMain
import org.assertj.core.api.Assertions
import org.junit.Test

class ExcludeFilesAndFolders {
    private val resource = "src/test/resources"

    @Test
    fun `should exclude files in ignored folders`() {
        val outputStream = StreamHelper.retrieveStreamAsString {
            SourceCodeParserMain.mainWithOutputStream(it, arrayOf(resource, "-e=/bar/"))
        }

        Assertions.assertThat(outputStream.lines()[0]).doesNotContain(""""name":"bar""")
        Assertions.assertThat(outputStream.lines()[0]).doesNotContain(""""name":"hello.java""")
    }

    @Test
    fun `should exclude files in multiple ignored folders`() {
        val outputStream = StreamHelper.retrieveStreamAsString {
            SourceCodeParserMain.mainWithOutputStream(it, arrayOf(resource, "-e=/bar/", "-e=/sonar_issues_java/"))
        }

        Assertions.assertThat(outputStream.lines()[0]).doesNotContain(""""name":"bar""")
        Assertions.assertThat(outputStream.lines()[0]).doesNotContain(""""name":"hello.java""")
        Assertions.assertThat(outputStream.lines()[0]).doesNotContain(""""name":"sonar_issues_java""")
    }

    @Test
    fun `should exclude files where regex pattern matches`() {
        val outputStream = StreamHelper.retrieveStreamAsString {
            SourceCodeParserMain.mainWithOutputStream(it, arrayOf(resource, "-e=/sonar.*/"))
        }
        Assertions.assertThat(outputStream.lines()[0]).doesNotContain(""""name":"sonar_issues_java""")
    }

    @Test
    fun `should exclude files with defaultExcludes option`() {
        val outputStream = StreamHelper.retrieveStreamAsString {
            SourceCodeParserMain.mainWithOutputStream(it, arrayOf(resource, "--defaultExcludes"))
        }
        Assertions.assertThat(outputStream.lines()[0]).doesNotContain(""""name":".whatever""")
        Assertions.assertThat(outputStream.lines()[0]).doesNotContain(""""name":"something.java""")
    }
}