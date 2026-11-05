package de.maibornwolff.codecharta.util

import java.io.File
import java.nio.ByteBuffer
import java.nio.charset.CharacterCodingException
import java.nio.charset.Charset
import java.nio.charset.CodingErrorAction

/**
 * The text of a source file, read as UTF-8. VBA modules and Access queries, which the VBA editor and Access export in
 * the Windows code page, read as cp1252 when they are no valid UTF-8.
 */
object SourceText {
    private val WINDOWS_CODE_PAGE: Charset = charset("windows-1252")
    private val WINDOWS_CODE_PAGE_EXTENSIONS = listOf(FileExtension.VBA, FileExtension.VB6)
        .flatMap { listOf(it.primaryExtension) + it.otherValidExtensions }

    fun read(file: File): String {
        if (!isExportedInWindowsCodePage(file)) return file.readText()
        val bytes = file.readBytes()
        return strictUtf8Of(bytes) ?: String(bytes, WINDOWS_CODE_PAGE)
    }

    private fun isExportedInWindowsCodePage(file: File): Boolean =
        WINDOWS_CODE_PAGE_EXTENSIONS.any { file.name.endsWith(it, ignoreCase = true) } || AccessQueryFiles.isQueryFile(file.path)

    private fun strictUtf8Of(bytes: ByteArray): String? = try {
        Charsets.UTF_8
            .newDecoder()
            .onMalformedInput(CodingErrorAction.REPORT)
            .onUnmappableCharacter(CodingErrorAction.REPORT)
            .decode(ByteBuffer.wrap(bytes))
            .toString()
    } catch (_: CharacterCodingException) {
        null
    }
}
