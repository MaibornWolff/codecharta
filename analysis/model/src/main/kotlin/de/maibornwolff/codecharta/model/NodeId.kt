package de.maibornwolff.codecharta.model

import java.security.MessageDigest
import java.text.Normalizer

/**
 * The single owner of node identity for the `.cc.json` 2.0 format.
 *
 * A node's identity is its **tree position and its [NodeType]**: the segment names from the root's
 * children down to the node (the root itself is excluded) plus whether it is a File, Folder, etc. The
 * position is rendered into a single *canonical path* string, the type name is prepended, and the pair
 * is hashed into a short, stable [id] that every suite tool reproduces for the same node.
 *
 * Type is part of the identity because 1.x legally allows a File and a Folder with the same name under
 * one parent; without it they would hash to the same id and collide. Type is mixed in only at the hash
 * layer ([idFromCanonicalPath]) — never into [canonicalPath], which also renders edge-endpoint strings
 * and error messages and must stay type-free. The preimage `type.name + canonicalPath` is injective
 * because a canonical path always begins with `/` and a [NodeType] name never contains `/`.
 *
 * Edge endpoints carry no type on the wire, so [fromEndpoint] assumes [NodeType.File] by default. A
 * producer whose edge legitimately targets a non-File node must resolve that node's real type from the
 * tree and pass it, or the endpoint id will not match the target node's id and the edge will drop.
 *
 * Canonical path rules (this is the keystone of cross-tool reproducibility):
 * - `root` is excluded, segments are joined with `/`, and the string is prefixed with `/`.
 * - empty segments are dropped, `.` is removed and `..` collapses the previous segment.
 * - segments are Unicode NFC-normalized (macOS stores filenames NFD, Linux NFC) so the same file
 *   hashes identically across operating systems.
 * - case is preserved (filesystems are treated as case-sensitive).
 *
 * Precondition — producers must PRE-SEGMENT paths. [canonicalSegments]/[fromSegments]/[canonicalPath]
 * take an already-split segment list; they never split on a path separator (and [canonicalize]
 * `require`s a segment to contain no `/`). A backslash `\` is a valid filename character on Linux, so
 * NodeId treats it as a literal: a producer holding a raw OS path must split it itself (on `/`, and on
 * Windows also on `\`) before handing the segments in. Edge endpoints are the one exception — the wire
 * format roots them with `/`, so [fromEndpoint] splits the endpoint string on `/` only.
 *
 * The canonicalizer only removes *spurious* divergence (the synthetic root name, `.`/`..`, Unicode
 * form, trailing slash). It deliberately does not reconcile *semantic* divergence (a tool that
 * genuinely roots the tree at a different depth): that is the merge resolver's job.
 */
object NodeId {
    const val ID_LENGTH = 16
    const val ROOT_SEGMENT = "root"
    const val SEPARATOR = "/"

    /**
     * The canonicalized segment list of a tree position (root excluded): empty segments dropped, `.`
     * removed, `..` collapsed, each segment NFC-normalized, case preserved. Producers that build a
     * node tree from raw paths should derive their positions through this so the tree position and
     * the [id] always agree. The input must already be split into segments (see the class precondition).
     */
    fun canonicalSegments(segments: List<String>): List<String> = canonicalize(segments)

    /**
     * The canonical path string for the node reached by following [segments] from the root's
     * children down. The root is excluded, so the root node itself canonicalizes to `"/"`.
     */
    fun canonicalPath(segments: List<String>): String = SEPARATOR + canonicalSegments(segments).joinToString(SEPARATOR)

    /**
     * id of the [type] node at [segments] = the first [ID_LENGTH] hex chars of `sha-256(type + path)`.
     * [type] defaults to [NodeType.File]; a folder-position caller must pass [NodeType.Folder] (etc.)
     * or its id will not match the id the writer assigns that folder node.
     */
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

    /**
     * id of the node referenced by an edge endpoint string such as `"/root/src/App.kt"`.
     * The endpoint is canonicalized first, then a leading synthetic `root` segment is stripped, so an
     * edge endpoint and the FileTree node it points at always resolve to the same id even when the
     * endpoint carries `.`/`..`/empty cruft before the root. The wire carries no type for endpoints, so
     * [type] defaults to [NodeType.File]; a caller whose edge targets a non-File node must resolve that
     * node's real type from the tree and pass it (see the class KDoc).
     */
    fun fromEndpoint(endpoint: String, type: NodeType = NodeType.File): String = fromSegments(segmentsFromEndpoint(endpoint), type)

    /** The canonical path for an edge endpoint string (the [fromEndpoint] counterpart before hashing). */
    fun canonicalPathFromEndpoint(endpoint: String): String = canonicalPath(segmentsFromEndpoint(endpoint))

    /** The `"/root/…"` edge-endpoint string for a node at the given canonical [segments] (inverse of [fromEndpoint]). */
    fun endpointFromSegments(segments: List<String>): String {
        val canonicalString = canonicalPath(segments)
        return if (canonicalString == SEPARATOR) SEPARATOR + ROOT_SEGMENT else SEPARATOR + ROOT_SEGMENT + canonicalString
    }

    /**
     * The canonical, root-stripped tree-position segments of an edge endpoint string (inverse of
     * [endpointFromSegments]). Producers that need to materialize the file node an edge points at —
     * e.g. the 2.0 writer, so edge-only projects keep their edges through a round-trip — derive the
     * node's position through this so it hashes to the same [id] the edge references.
     */
    fun segmentsFromEndpoint(endpoint: String): List<String> {
        val canonical = canonicalize(endpoint.split(SEPARATOR))
        return if (canonical.firstOrNull() == ROOT_SEGMENT) canonical.drop(1) else canonical
    }

    private fun canonicalize(segments: List<String>): List<String> {
        val result = ArrayDeque<String>()
        segments.forEach { rawSegment ->
            require(SEPARATOR !in rawSegment) {
                "NodeId segments must be pre-split; got a segment containing a '$SEPARATOR' separator: '$rawSegment'"
            }
            when (val segment = Normalizer.normalize(rawSegment, Normalizer.Form.NFC)) {
                "", "." -> Unit
                ".." -> if (result.isNotEmpty()) result.removeLast()
                else -> result.addLast(segment)
            }
        }
        return result.toList()
    }
}
