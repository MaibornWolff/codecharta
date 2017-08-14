package de.maibornwolff.codecharta.filter.mergefilter

import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import org.hamcrest.CoreMatchers
import org.junit.Assert
import org.junit.Test
import java.io.InputStreamReader

val DEFAULT_API_VERSION = "1.0"

class ProjectMergerTest {
    val nodeMergerStrategy = RecursiveNodeMergerStrategy()


    @Test(expected = MergeException::class)
    fun should_throw_exception_if_APIVersion_NotSupported() {
        // given
        val project = Project("project", listOf(), "unsupported Version")

        // when
        ProjectMerger(listOf(project), nodeMergerStrategy).merge()

        // then throw exception
    }

    @Test(expected = MergeException::class)
    fun should_throw_exception_if_multiple_names_provided() {
        // given
        val projects = listOf(Project("test1", listOf(), DEFAULT_API_VERSION), Project("test2", listOf(), DEFAULT_API_VERSION))

        // when
        ProjectMerger(projects, nodeMergerStrategy).extractProjectName()

        // then throw exception
    }

    @Test
    fun should_extract_project_name_if_the_same() {
        // given
        val projectName = "test"
        val projects = listOf(Project(projectName, listOf(), DEFAULT_API_VERSION), Project(projectName, listOf(), DEFAULT_API_VERSION))

        // when
        val name = ProjectMerger(projects, nodeMergerStrategy).extractProjectName()

        // then
        Assert.assertThat(name, CoreMatchers.`is`(projectName))
    }

    @Test(expected = MergeException::class)
    fun should_throw_exception_if_multiple_APIVersion_provided() {
        // given
        val projectName = "test"
        val projects = listOf(Project(projectName, listOf(), "1.0"), Project(projectName, listOf(), "2.0"))

        // when
        ProjectMerger(projects, nodeMergerStrategy).merge()

        // then throw exception
    }

    val TEST_JSON_FILE = "test.json"
    val TEST_JSON_FILE2 = "test2.json"

    @Test
    fun merging_same_project_should_return_project() {
        // given
        val inStream = this.javaClass.classLoader.getResourceAsStream(TEST_JSON_FILE)
        val originalProject = ProjectDeserializer.deserializeProject(InputStreamReader(inStream))
        val projectList = listOf(originalProject, originalProject)

        // when
        val project = ProjectMerger(projectList, nodeMergerStrategy).merge()

        // then
        Assert.assertThat(project, CoreMatchers.`is`(originalProject))
    }

    @Test
    fun merging_different_projects_should_return_merged_project() {
        // given
        val originalProject1 = ProjectDeserializer.deserializeProject(InputStreamReader(this.javaClass.classLoader.getResourceAsStream(TEST_JSON_FILE)))
        val originalProject2 = ProjectDeserializer.deserializeProject(InputStreamReader(this.javaClass.classLoader.getResourceAsStream(TEST_JSON_FILE2)))
        val projectList = listOf(originalProject1, originalProject2)

        // when
        val project = ProjectMerger(projectList, nodeMergerStrategy).merge()

        // then
        Assert.assertThat(project == originalProject1, CoreMatchers.`is`(false))
        Assert.assertThat(project == originalProject2, CoreMatchers.`is`(false))
    }
}