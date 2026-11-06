package de.maibornwolff.codecharta.util

import java.io.File
import java.nio.ByteBuffer
import java.nio.charset.CharacterCodingException
import java.nio.charset.Charset
import java.nio.charset.CodingErrorAction

/**
 * The text of a source file, read as UTF-8. VBA modules and Access queries, which the VBA editor and Access export in
 * the Windows code page, read as cp1252 when they are no valid UTF-8. An Access form or report layout, which
 * `SaveAsText` writes in UTF-16, reads in the encoding its byte order mark names, else like a VBA module.
 */
object SourceText {
    private val WINDOWS_CODE_PAGE: Charset = charset("windows-1252")
    private val WINDOWS_CODE_PAGE_EXTENSIONS = extensionsOf(FileExtension.VBA, FileExtension.VB6)
    private val BYTE_ORDER_MARK_EXTENSIONS = extensionsOf(FileExtension.ACCESS_LAYOUT)
    private val BYTE_ORDER_MARKS = listOf(
        byteArrayOf(0xEF.toByte(), 0xBB.toByte(), 0xBF.toByte()) to Charsets.UTF_8,
        byteArrayOf(0xFF.toByte(), 0xFE.toByte()) to Charsets.UTF_16LE,
        byteArrayOf(0xFE.toByte(), 0xFF.toByte()) to Charsets.UTF_16BE
    )

    fun read(file: File): String {
        if (hasExtension(file, BYTE_ORDER_MARK_EXTENSIONS)) return textByByteOrderMark(file.readBytes())
        if (!isExportedInWindowsCodePage(file)) return file.readText()
        return utf8OrWindowsCodePage(file.readBytes())
    }

    private fun textByByteOrderMark(bytes: ByteArray): String {
        val (mark, charset) = BYTE_ORDER_MARKS.firstOrNull { (mark, _) -> startsWith(bytes, mark) } ?: return utf8OrWindowsCodePage(bytes)
        return String(bytes, mark.size, bytes.size - mark.size, charset)
    }

    private fun utf8OrWindowsCodePage(bytes: ByteArray): String = strictUtf8Of(bytes) ?: String(bytes, WINDOWS_CODE_PAGE)

    private fun extensionsOf(vararg fileExtensions: FileExtension): List<String> =
        fileExtensions.flatMap { listOf(it.primaryExtension) + it.otherValidExtensions }

    private fun hasExtension(file: File, extensions: List<String>): Boolean = extensions.any { file.name.endsWith(it, ignoreCase = true) }

    private fun isExportedInWindowsCodePage(file: File): Boolean =
        hasExtension(file, WINDOWS_CODE_PAGE_EXTENSIONS) || AccessQueryFiles.isQueryFile(file.path)

    private fun startsWith(bytes: ByteArray, prefix: ByteArray): Boolean =
        bytes.size >= prefix.size && prefix.indices.all { bytes[it] == prefix[it] }

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
