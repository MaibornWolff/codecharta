/*
 * Copyright (c) 2017, MaibornWolff GmbH
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *  * Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *  * Neither the name of  nor the names of its contributors may be used to
 *    endorse or promote products derived from this software without specific
 *    prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

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