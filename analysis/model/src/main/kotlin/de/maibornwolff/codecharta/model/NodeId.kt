package de.maibornwolff.codecharta.model

import java.security.MessageDigest
import java.text.Normalizer

object NodeId {
    const val ID_LENGTH = 16
    const val ROOT_SEGMENT = "root"
    const val SEPARATOR = "/"

    fun canonicalSegments(segments: List<String>): List<String> = canonicalize(segments)

    // NFC-normalize so macOS NFD and Linux NFC names hash identically.
    fun normalizeName(name: String): String = Normalizer.normalize(name, Normalizer.Form.NFC)

    fun canonicalPath(segments: List<String>): String = SEPARATOR + canonicalSegments(segments).joinToString(SEPARATOR)

    fun fromSegments(segments: List<String>, type: NodeType = NodeType.File): String = idFromCanonicalPath(canonicalPath(segments), type)

    /** id of the [type] node whose pre-computed canonical path is [canonicalPath]. */
    fun idFromCanonicalPath(canonicalPath: String, type: NodeType = NodeType.File): String {
        val preimage = type.name + canonicalPath
        val digest = MessageDigest.getInstance("SHA-256").digest(preimage.toByteArray(Charsets.UTF_8))
        return digest
            .joinToString("") { byte ->
                val unsigned = byte.toInt() and 0xFF
                unsigned.toString(16).padStart(2, '0')
            }.substring(0, ID_LENGTH)
    }

    // Canonicalizes and strips the leading /root before hashing, so edge endpoints agree with tree node ids.
    fun fromEndpoint(endpoint: String, type: NodeType = NodeType.File): String = fromSegments(segmentsFromEndpoint(endpoint), type)

    fun canonicalPathFromEndpoint(endpoint: String): String = canonicalPath(segmentsFromEndpoint(endpoint))

    fun endpointFromSegments(segments: List<String>): String {
        val canonicalString = canonicalPath(segments)
        return if (canonicalString == SEPARATOR) SEPARATOR + ROOT_SEGMENT else SEPARATOR + ROOT_SEGMENT + canonicalString
    }

    fun segmentsFromEndpoint(endpoint: String): List<String> {
        val canonical = canonicalize(endpoint.split(SEPARATOR))
        return if (canonical.firstOrNull() == ROOT_SEGMENT) canonical.drop(1) else canonical
    }

    private fun canonicalize(segments: List<String>): List<String> {
        val result = ArrayDeque<String>()
        segments.forEach { rawSegment ->
            require(SEPARATOR !in rawSegment) {
                "A file or folder name may not contain '$SEPARATOR', which the .cc.json 2.0 format reserves as the " +
                    "path separator when building node ids: '$rawSegment'. Check the input's path separator " +
                    "(e.g. csvimport --path-separator) so paths are split into segments."
            }
            when (val segment = normalizeName(rawSegment)) {
                "", "." -> Unit
                ".." -> if (result.isNotEmpty()) result.removeLast()
                else -> result.addLast(segment)
            }
        }
        return result.toList()
    }
}
