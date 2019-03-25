package de.maibornwolff.codecharta.importer.sourcecodeparser

import org.junit.Test
import java.io.File
import org.assertj.core.api.Assertions.assertThat

class ProjectParserTest{

    @Test
    fun metricsAreFound(){
        val projectParser = ProjectParser()
        projectParser.scanProject(File("src/test/resources").absoluteFile)

        assertThat(projectParser.metricKinds.toString()).contains("functions")
        assertThat(projectParser.metricKinds.toString()).contains("ncloc")
    }
}