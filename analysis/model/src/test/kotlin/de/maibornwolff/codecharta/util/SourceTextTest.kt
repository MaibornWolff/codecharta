package de.maibornwolff.codecharta.util

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

class SourceTextTest {
    private val windowsCodePage = charset("windows-1252")

    @Test
    fun `should read a VBA module in the Windows code page when it is no valid UTF-8`(
        @TempDir root: File
    ) {
        // Arrange
        val module = root.resolve("modBestellung.bas").also { it.writeBytes("' Bestellübersicht für Kunden".toByteArray(windowsCodePage)) }

        // Act
        val text = SourceText.read(module)

        // Assert
        assertThat(text).isEqualTo("' Bestellübersicht für Kunden")
    }

    @Test
    fun `should read a VBA module in UTF-8 when it is valid UTF-8`(
        @TempDir root: File
    ) {
        // Arrange
        val module = root.resolve("clsKunde.cls").also { it.writeText("' Größe in Ångström") }

        // Act
        val text = SourceText.read(module)

        // Assert
        assertThat(text).isEqualTo("' Größe in Ångström")
    }

    @Test
    fun `should read an Access query in the Windows code page, but other SQL and other files in UTF-8 only`(
        @TempDir root: File
    ) {
        // Arrange
        val bytes = "SELECT Bestätigung FROM Aufträge;".toByteArray(windowsCodePage)
        val query = root.resolve("queries").also { it.mkdirs() }.resolve("qryAufträge.sql").also { it.writeBytes(bytes) }
        val script = root.resolve("scripts").also { it.mkdirs() }.resolve("aufträge.sql").also { it.writeBytes(bytes) }
        val kotlin = root.resolve("Main.kt").also { it.writeBytes(bytes) }

        // Act
        val texts = listOf(query, script, kotlin).map { SourceText.read(it) }

        // Assert
        assertThat(texts[0]).isEqualTo("SELECT Bestätigung FROM Aufträge;")
        assertThat(texts.drop(1)).allMatch { it.contains('�') }
    }
}
