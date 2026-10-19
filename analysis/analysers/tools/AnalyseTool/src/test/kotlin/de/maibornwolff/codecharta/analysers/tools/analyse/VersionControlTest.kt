package de.maibornwolff.codecharta.analysers.tools.analyse

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

class VersionControlTest {
    @TempDir
    lateinit var workspace: File

    @Test
    fun `should find the repository a folder lies in`() {
        // Arrange
        val repository = File(workspace, "home/shop").apply { File(this, ".git").mkdirs() }
        val module = File(repository, "module").apply { mkdirs() }

        // Act
        val root = VersionControl.GIT.enclosingRootOf(module, ceiling = File(workspace, "home"))

        // Assert
        assertThat(root).isEqualTo(repository.absoluteFile)
    }

    @Test
    fun `should not count a repository at or above the ceiling such as one in the home folder`() {
        // Arrange
        val home = File(workspace, "home").apply { File(this, ".git").mkdirs() }
        val project = File(home, "projects/shop").apply { mkdirs() }

        // Act
        val root = VersionControl.GIT.enclosingRootOf(project, ceiling = home)

        // Assert
        assertThat(root).isNull()
    }

    @Test
    fun `should take the log parser names for their histories and keep every other name`() {
        // Act
        val names = listOf("gitlogparser", "svnlogparser", "unifiedparser").map(VersionControl::sourceNameOf)

        // Assert
        assertThat(names).containsExactly("git", "svn", "unifiedparser")
    }
}
