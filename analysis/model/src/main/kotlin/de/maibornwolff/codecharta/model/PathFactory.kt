package de.maibornwolff.codecharta.model

object PathFactory {
    fun fromFileSystemPath(path: String, pathSeparator: Char = '/'): Path = Path(canonicalizeSegments(path.split(pathSeparator)))

    /**
     * Canonicalizes a split path into a tree position: empty segments are dropped, `.` is removed and
     * `..` collapses the previous segment. This is the structural half of [NodeId]'s canonicalization
     * (no NFC — the tree keeps original name spelling), so the tree a producer builds matches the ids
     * the 2.0 writer derives and `src/./App.kt` lands as `src/App.kt` instead of a phantom `.` folder.
     */
    private fun canonicalizeSegments(segments: List<String>): List<String> {
        val result = ArrayDeque<String>()
        segments.forEach { segment ->
            when (segment) {
                "", "." -> Unit
                ".." -> if (result.isNotEmpty()) result.removeLast()
                else -> result.addLast(segment)
            }
        }
        return result.toList()
    }

    fun extractOSIndependentPath(path: String): Path {
        if (path.contains("/") && path.contains("\\")) {
            println("Both slash and backslash was found in path $path. Assumed this to be a unix path.")
            return fromFileSystemPath(path, '/')
        }
        return if (path.contains("\\")) {
            fromFileSystemPath(path, '\\')
        } else {
            fromFileSystemPath(path, '/')
        }
    }
}
