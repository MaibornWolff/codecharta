package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.common

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

class ProjectListingTest {
    @TempDir
    lateinit var projectDirectory: File

    private fun write(relativePath: String): File {
        val file = File(projectDirectory, relativePath)
        file.parentFile.mkdirs()
        file.writeText("content")
        return file
    }

    private fun isNodeModules(folderName: String): Boolean = folderName == "node_modules"

    @Test
    fun `should list the files and folders below the root, the root among the folders, when nothing is registered`() {
        // Arrange
        write("src/app/main.py")
        write("README.md")

        // Act
        val listing = ProjectListing.of(projectDirectory)

        // Assert
        assertThat(listing.filesOutside { false }).containsExactly(listOf("README.md"), listOf("src", "app", "main.py"))
        assertThat(listing.foldersOutside { false }).containsExactly(emptyList(), listOf("src"), listOf("src", "app"))
    }

    @Test
    fun `should not walk into hidden folders when nothing is registered`() {
        // Arrange
        write(".git/objects/pack")
        write("main.py")

        // Act
        val listing = ProjectListing.of(projectDirectory)

        // Assert
        assertThat(listing.filesOutside { false }).containsExactly(listOf("main.py"))
        assertThat(listing.foldersOutside { false }).containsExactly(emptyList())
    }

    @Test
    fun `should list only the registered entries of a root`() {
        // Arrange
        val kept = write("src/main.py")
        write("generated/config.py")

        // Act
        ProjectListing.register(projectDirectory, listOf(kept.parentFile, kept))
        val listing = ProjectListing.of(projectDirectory)

        // Assert
        assertThat(listing.filesOutside { false }).containsExactly(listOf("src", "main.py"))
        assertThat(listing.foldersOutside { false }).containsExactly(emptyList(), listOf("src"))
    }

    @Test
    fun `should leave out the files and folders in or below a skipped folder`() {
        // Arrange
        write("node_modules/lib/index.js")
        write("src/node_modules.js")

        // Act
        val listing = ProjectListing.of(projectDirectory)

        // Assert
        assertThat(listing.filesOutside(::isNodeModules)).containsExactly(listOf("src", "node_modules.js"))
        assertThat(listing.foldersOutside(::isNodeModules)).containsExactly(emptyList(), listOf("src"))
        assertThat(listing.filePathsOutside(::isNodeModules)).containsExactly("src${File.separator}node_modules.js")
    }

    @Test
    fun `should resolve a listed path to its file below the root`() {
        // Arrange
        val file = write("src/main.py")

        // Act
        val resolved = ProjectListing.of(projectDirectory).fileAt(listOf("src", "main.py"))

        // Assert
        assertThat(resolved).isEqualTo(file)
    }
}
