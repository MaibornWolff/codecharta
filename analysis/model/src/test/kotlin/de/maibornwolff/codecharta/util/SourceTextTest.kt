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

    @Test
    fun `should read an Access form or report layout by its byte order mark, without the mark`(
        @TempDir root: File
    ) {
        // Arrange
        val layout = "Begin Form\n    Caption =\"Bestellübersicht\"\nEnd\n"
        val littleEndian = root.resolve("frmBestellung.form").also {
            it.writeBytes(
                byteArrayOf(0xFF.toByte(), 0xFE.toByte()) + layout.toByteArray(Charsets.UTF_16LE)
            )
        }
        val bigEndian = root.resolve("rptBestellung.report").also {
            it.writeBytes(
                byteArrayOf(0xFE.toByte(), 0xFF.toByte()) + layout.toByteArray(Charsets.UTF_16BE)
            )
        }
        val utf8 = root.resolve("frmKunde.form").also {
            it.writeBytes(
                byteArrayOf(0xEF.toByte(), 0xBB.toByte(), 0xBF.toByte()) + layout.toByteArray()
            )
        }

        // Act
        val texts = listOf(littleEndian, bigEndian, utf8).map { SourceText.read(it) }

        // Assert
        assertThat(texts).containsOnly(layout)
    }

    @Test
    fun `should read an Access layout without byte order mark like a VBA module`(
        @TempDir root: File
    ) {
        // Arrange
        val layout = root.resolve("frmBestellung.form").also { it.writeBytes("Caption =\"Bestellübersicht\"".toByteArray(windowsCodePage)) }

        // Act
        val text = SourceText.read(layout)

        // Assert
        assertThat(text).isEqualTo("Caption =\"Bestellübersicht\"")
    }
}
