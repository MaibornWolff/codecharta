package de.maibornwolff.codecharta.dialogProvider

import de.maibornwolff.codecharta.serialization.FileExtension
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.io.File

class DirectoryNavigatorTest {
    private val slash = File.separatorChar

    @Test
    fun `this should provide a good change directory experience`() {
        val uut = DirectoryNavigator(InputType.FOLDER_AND_FILE, listOf(FileExtension.CCJSON), false)
        val systemSlash = File.separatorChar
        uut.prepareMatches("")
        assertThat(uut.getHints()).isEqualTo(arrayOf("build$systemSlash", "src$systemSlash"))
    }

    @Test
    fun `should set input types correctly`() {
        val navigatorFiles = DirectoryNavigator(InputType.FILE, listOf(), false)
        val navigatorFolderAndFiles = DirectoryNavigator(InputType.FOLDER_AND_FILE, listOf(), false)
        val navigatorFolders = DirectoryNavigator(InputType.FOLDER, listOf(), false)

        assertThat(navigatorFiles.filesAllowed).isTrue()
        assertThat(navigatorFolderAndFiles.filesAllowed).isTrue()
        assertThat(navigatorFolders.filesAllowed).isFalse()
    }

    @Test
    fun `should filter possible file options correctly`() {
        val navigator = DirectoryNavigator(InputType.FILE, listOf(), false)
        assertThat(navigator.currentDirectoryContent.size).isEqualTo(3)
        assertThat(navigator.possibleDirectories.size).isEqualTo(2)
        assertThat(navigator.possibleFiles.size).isEqualTo(1)
    }

    @Test
    fun `should filter unaccepted file options`() {
        val navigator = DirectoryNavigator(InputType.FOLDER, listOf(), false)
        assertThat(navigator.currentDirectoryContent.size).isEqualTo(3)
        assertThat(navigator.possibleDirectories.size).isEqualTo(2)
        assertThat(navigator.possibleFiles.size).isEqualTo(0)
    }

    @Test
    fun `should perform an update cycle as expected `() {
        val resourcePath = "src/test/resources/"
        val matchingFile = "${resourcePath}validExtension.cc.json"
        val navigator = DirectoryNavigator(InputType.FOLDER_AND_FILE, listOf(FileExtension.CCJSON), false)

        navigator.prepareMatches(File(resourcePath).toString()+slash)
        val hints = navigator.getHints()
        val matchesString = navigator.getMatches()

        assertThat(hints.size).isEqualTo(1)
        assertThat(hints).containsExactly(File(matchingFile).toString())
        assertThat(matchesString).isEqualTo("validExtension.cc.json")
    }

}
