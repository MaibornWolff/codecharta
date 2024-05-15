package de.maibornwolff.codecharta.serialization

import java.io.BufferedInputStream
import java.io.InputStream
import java.util.zip.GZIPInputStream

object CompressedStreamHandler {
    fun wrapInput(input: InputStream): InputStream {
        if (input.available() == 0) {
            return input
        }
        var content = input
        if (!input.markSupported()) {
            content = BufferedInputStream(input)
        }
        content.mark(2)

        val firstValue = content.read()
        if (firstValue == -1) {
            content.reset()
            return content
        }
        val secondValue = content.read()
        if (secondValue == -1) {
            content.reset()
            return content
        }
        val byteArray = byteArrayOf(firstValue.toByte(), secondValue.toByte())

        content.reset()
        if (isGzipByteHeader(byteArray)) {
            return GZIPInputStream(content)
        }
        return content
    }

    private fun isGzipByteHeader(bytes: ByteArray): Boolean {
        if (bytes.isEmpty()) return false
        return bytes[0] == (GZIPInputStream.GZIP_MAGIC.toByte()) && bytes[1] == (GZIPInputStream.GZIP_MAGIC ushr 8).toByte()
    }
}
