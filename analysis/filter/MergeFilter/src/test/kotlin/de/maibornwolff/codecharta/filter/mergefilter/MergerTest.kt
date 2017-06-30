package de.maibornwolff.codecharta.filter.mergefilter

import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import org.hamcrest.CoreMatchers.`is`
import org.junit.Assert.assertThat
import org.junit.Test
import java.io.InputStreamReader

val DEFAULT_API_VERSION = "1.0"

class MergerTest {

    @Test(expected = MergeException::class)
    fun shouldThrowExceptionIfMultipleNamesProvided() {
        val projects = listOf(Project("test1", listOf(), DEFAULT_API_VERSION), Project("test2", listOf(), DEFAULT_API_VERSION))
        ProjectMerger(projects).extractProjectName()
    }

    @Test
    fun shouldExtractProjectNameIfAllTheSame() {
        val expectedName = "test"
        val projects = listOf(Project(expectedName, listOf(), DEFAULT_API_VERSION), Project(expectedName, listOf(), DEFAULT_API_VERSION))
        val name = ProjectMerger(projects).extractProjectName()

        assertThat(name, `is`(expectedName))
    }

    @Test(expected = MergeException::class)
    fun shouldThrowExceptionIfMultipleCCVersionProvided() {
        val expectedName = "test"
        val projects = listOf(Project(expectedName, listOf(), "1.0"), Project(expectedName, listOf(), "2.0"))
        ProjectMerger(projects).merge()
    }

    private val TEST_JSON_FILE = "test.json"
    private val TEST_JSON_FILE2 = "test2.json"

    @Test
    fun merging_same_project_should_return_project() {
        val inStream = this.javaClass.classLoader.getResourceAsStream(TEST_JSON_FILE)
        val originalProject = ProjectDeserializer.deserializeProject(InputStreamReader(inStream))
        val projectList = listOf(originalProject, originalProject)

        val project = ProjectMerger(projectList).merge()

        assertThat(project, `is`(originalProject))
    }

    @Test
    fun merging_different_projects_should_return_merged_project() {
        val originalProject1 = ProjectDeserializer.deserializeProject(InputStreamReader(this.javaClass.classLoader.getResourceAsStream(TEST_JSON_FILE)))
        val originalProject2 = ProjectDeserializer.deserializeProject(InputStreamReader(this.javaClass.classLoader.getResourceAsStream(TEST_JSON_FILE2)))

        val projectList = listOf(originalProject1, originalProject2)

        val project = ProjectMerger(projectList).merge()

        assertThat(project == originalProject1, `is`(false))
        assertThat(project == originalProject2, `is`(false))
    }

}