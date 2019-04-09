package de.maibornwolff.codecharta.importer.sourcecodeparser

import com.nhaarman.mockito_kotlin.doReturn
import com.nhaarman.mockito_kotlin.mock
import com.nhaarman.mockito_kotlin.times
import com.nhaarman.mockito_kotlin.verify
import org.assertj.core.api.Assertions.assertThat
import org.junit.Ignore
import org.junit.Test
import java.io.File

class ProjectParserTest{

    @Test
    @Ignore
    fun metricsAreFound(){
        val projectParser = ProjectParser()
        projectParser.scanProject(File("src/test/resources").absoluteFile)

        assertThat(projectParser.metricKinds.toString()).contains("functions")
        assertThat(projectParser.metricKinds.toString()).contains("ncloc")
    }

    @Test
    @Ignore
    fun `metrics are added to metricKinds`() {

    }

    @Test
    @Ignore
    fun `files are added to project metrics`() {

    }

    @Test
    @Ignore
    fun `project metrics for files are correct`() {

    }

    /*@Test @Ignore
    fun `sonar analyzers are initialized`() {
        val rootFile = File("foo").absoluteFile
        val mockJavaSonarAnalyzer = mock(JavaSonarAnalyzer::class.java)

        val projectParser = ProjectParser()

        projectParser.scanProject(rootFile)

        verify(mockJavaSonarAnalyzer, times(1)).scanFiles(listOf())
    }*/

    @Test
    @Ignore
    fun `project Traverser is set up with correct root dir`() {
        val rootFile = File("foo").absoluteFile
        //val mockProjectTraverser = mock(ProjectTraverser::class.java)
        //when(mockProjectTraverser.createFor())

    }

    @Test
    @Ignore
    fun `analyzers are started with the correct files`() {
        val rootFile = File("src/test/resources").absoluteFile
        val mockProjectTraverser = mock<ProjectTraverser> {
            on { getFileListByExtension("java") } doReturn listOf("foo", "bar")
        }

        val projectParser = ProjectParser()
        //projectParser.projectTraverser =

        verify(mockProjectTraverser, times(1)).getFileListByExtension("java")
    }
}