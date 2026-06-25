package de.maibornwolff.codecharta.model

import java.security.MessageDigest
import java.text.Normalizer

/**
 * The single owner of node identity for the `.cc.json` 2.0 format.
 *
 * A node's identity is its **tree position**: the segment names from the root's children down to
 * the node (the root itself is excluded). That position is rendered into a single *canonical path*
 * string and hashed into a short, stable [id] that every suite tool reproduces for the same file.
 *
 * Canonical path rules (this is the keystone of cross-tool reproducibility):
 * - `root` is excluded, segments are joined with `/`, and the string is prefixed with `/`.
 * - empty segments are dropped, `.` is removed and `..` collapses the previous segment.
 * - segments are Unicode NFC-normalized (macOS stores filenames NFD, Linux NFC) so the same file
 *   hashes identically across operating systems.
 * - case is preserved (filesystems are treated as case-sensitive).
 *
 * The canonicalizer only removes *spurious* divergence (separators, the synthetic root name,
 * `.`/`..`, Unicode form, trailing slash). It deliberately does not reconcile *semantic* divergence
 * (a tool that genuinely roots the tree at a different depth): that is the merge resolver's job.
 */
object NodeId {
    const val ID_LENGTH = 16
    const val ROOT_SEGMENT = "root"
    const val SEPARATOR = "/"

    /**
     * The canonicalized segment list of a tree position (root excluded): empty segments dropped, `.`
     * removed, `..` collapsed, each segment NFC-normalized, case preserved. Producers that build a
     * node tree from raw paths should derive their positions through this so the tree position and
     * the [id] always agree.
     */
    fun canonicalSegments(segments: List<String>): List<String> = canonicalize(segments)

    /**
     * The canonical path string for the node reached by following [segments] from the root's
     * children down. The root is excluded, so the root node itself canonicalizes to `"/"`.
     */
    fun canonicalPath(segments: List<String>): String = SEPARATOR + canonicalSegments(segments).joinToString(SEPARATOR)

    /** id of the node at [segments] = the first [ID_LENGTH] hex chars of `sha-256(canonicalPath)`. */
    fun fromSegments(segments: List<String>): String = idFromCanonicalPath(canonicalPath(segments))

    /** id of the node whose pre-computed canonical path is [canonicalPath]. */
    fun idFromCanonicalPath(canonicalPath: String): String {
        val digest = MessageDigest.getInstance("SHA-256").digest(canonicalPath.toByteArray(Charsets.UTF_8))
        return digest
            .joinToString("") { byte ->
                val unsigned = byte.toInt() and 0xFF
                unsigned.toString(16).padStart(2, '0')
            }.substring(0, ID_LENGTH)
    }

    /**
     * id of the node referenced by an edge endpoint string such as `"/root/src/App.kt"`.
     * The endpoint is canonicalized first, then a leading synthetic `root` segment is stripped, so an
     * edge endpoint and the FileTree node it points at always resolve to the same id even when the
     * endpoint carries `.`/`..`/empty cruft before the root.
     */
    fun fromEndpoint(endpoint: String): String = fromSegments(segmentsFromEndpoint(endpoint))

    /** The canonical path for an edge endpoint string (the [fromEndpoint] counterpart before hashing). */
    fun canonicalPathFromEndpoint(endpoint: String): String = canonicalPath(segmentsFromEndpoint(endpoint))

    /** The `"/root/…"` edge-endpoint string for a node at the given canonical [segments] (inverse of [fromEndpoint]). */
    fun endpointFromSegments(segments: List<String>): String {
        val canonicalString = canonicalPath(segments)
        return if (canonicalString == SEPARATOR) SEPARATOR + ROOT_SEGMENT else SEPARATOR + ROOT_SEGMENT + canonicalString
    }

    private fun segmentsFromEndpoint(endpoint: String): List<String> {
        val canonical = canonicalize(endpoint.split(SEPARATOR))
        return if (canonical.firstOrNull() == ROOT_SEGMENT) canonical.drop(1) else canonical
    }

    private fun canonicalize(segments: List<String>): List<String> {
        val result = ArrayDeque<String>()
        segments.forEach { rawSegment ->
            when (val segment = Normalizer.normalize(rawSegment, Normalizer.Form.NFC)) {
                "", "." -> Unit
                ".." -> if (result.isNotEmpty()) result.removeLast()
                else -> result.addLast(segment)
            }
        }
        return result.toList()
    }
}
