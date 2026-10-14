package de.maibornwolff.codecharta.analysers.analyserinterface.scan

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

class UndecodableFileNameTest {
    @TempDir
    lateinit var projectDirectory: File

    @Test
    fun `should report a listed name that the file name encoding could not decode`() {
        // Arrange
        val mangledEntry = File(projectDirectory, "Zentaurenh��hle.kt")

        // Act
        val isUndecodable = UndecodableFileName.reportIfUndecodable(mangledEntry)

        // Assert
        assertThat(isUndecodable).isTrue()
    }

    @Test
    fun `should not report a file whose name was decoded`() {
        // Arrange
        val decodedFile = File(projectDirectory, "Zentaurenhöhle.kt").apply { writeText("class Zentaurenhöhle") }

        // Act
        val isUndecodable = UndecodableFileName.reportIfUndecodable(decodedFile)

        // Assert
        assertThat(isUndecodable).isFalse()
    }

    @Test
    fun `should not report an existing file that holds the replacement character in its name`() {
        // Arrange
        val existingFile = File(projectDirectory, "odd�name.kt").apply { writeText("class Odd") }

        // Act
        val isUndecodable = UndecodableFileName.reportIfUndecodable(existingFile)

        // Assert
        assertThat(isUndecodable).isFalse()
    }
}
