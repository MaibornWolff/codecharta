package de.maibornwolff.codecharta.analysers.parsers.gitlog.parser.git.helper

import java.io.ByteArrayOutputStream

// git -c core.quotepath=off suppresses C-style octet escapes for non-ASCII paths; this unquoter strips
// them from log output that was collected without that flag so externally-generated logs parse correctly.
object GitPathUnquoter {
    fun unquote(path: String): String {
        if (path.length < 2 || path.first() != '"' || path.last() != '"') return path

        val inner = path.substring(1, path.length - 1)
        if (!inner.contains('\\')) return inner

        val bytes = ByteArrayOutputStream(inner.length)
        var i = 0
        while (i < inner.length) {
            if (inner[i] != '\\') {
                val runStart = i
                while (i < inner.length && inner[i] != '\\') i++
                bytes.write(inner.substring(runStart, i).toByteArray(Charsets.UTF_8))
                continue
            }
            if (i + 1 >= inner.length) {
                bytes.write('\\'.code)
                i++
                continue
            }
            i = decodeEscape(inner, i, bytes)
        }
        return String(bytes.toByteArray(), Charsets.UTF_8)
    }

    private fun decodeEscape(inner: String, backslashIndex: Int, bytes: ByteArrayOutputStream): Int {
        val next = inner[backslashIndex + 1]
        val simple = SIMPLE_ESCAPES[next]
        if (simple != null) {
            bytes.write(simple)
            return backslashIndex + 2
        }
        if (next in '0'..'7') {
            var value = 0
            var index = backslashIndex + 1
            var digits = 0
            while (index < inner.length && digits < 3 && inner[index] in '0'..'7') {
                value = value * 8 + (inner[index] - '0')
                index++
                digits++
            }
            bytes.write(value and 0xFF)
            return index
        }
        // Unknown escape: keep the backslash literally and let the following char be handled normally.
        bytes.write('\\'.code)
        return backslashIndex + 1
    }

    private val SIMPLE_ESCAPES: Map<Char, Int> = mapOf(
        'a' to 0x07,
        'b' to 0x08,
        'f' to 0x0C,
        'n' to 0x0A,
        'r' to 0x0D,
        't' to 0x09,
        'v' to 0x0B,
        '"' to '"'.code,
        '\\' to '\\'.code
    )
}
