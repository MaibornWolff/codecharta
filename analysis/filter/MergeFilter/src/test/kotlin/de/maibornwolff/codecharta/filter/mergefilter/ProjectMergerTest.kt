package de.maibornwolff.codecharta.filter.mergefilter

import de.maibornwolff.codecharta.model.Project
import org.junit.Test

class ProjectMergerTest {
    @Test(expected = MergeException::class)
    fun shouldThrowExceptionIfAPIVersionNotSupported() {
        val project = Project("project", listOf(), "unsupported Version")
        val merger = ProjectMerger(listOf(project))
        merger.merge()
    }
}