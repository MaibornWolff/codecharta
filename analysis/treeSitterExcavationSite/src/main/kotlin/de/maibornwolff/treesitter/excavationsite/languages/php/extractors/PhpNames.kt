package de.maibornwolff.treesitter.excavationsite.languages.php.extractors

/** What a name written in a namespace block means, by the rules of `php.md`: the full path of a class. */
internal class PhpNames(private val namespace: List<String>, private val imports: PhpImports) {
    /** The class a name means, null for `self`, `static`, `parent` and the type keywords. */
    fun classPath(written: String): List<String>? {
        val segments = segmentsOf(written)
        if (segments.size == 1 && segments.single().lowercase() in RESERVED_NAMES) return null
        return pathOf(written, segments) { imports.classPath(it) }
    }

    private fun pathOf(written: String, segments: List<String>, imported: (String) -> List<String>?): List<String> {
        if (written.startsWith(SEPARATOR)) return segments
        if (segments.first().lowercase() == NAMESPACE_KEYWORD) return namespace + segments.drop(1)
        return imported(segments.first())?.let { it + segments.drop(1) } ?: (namespace + segments)
    }

    private fun segmentsOf(written: String): List<String> = written.removePrefix(SEPARATOR).split(SEPARATOR)

    companion object {
        private const val SEPARATOR = "\\"
        private const val NAMESPACE_KEYWORD = "namespace"
        private val RESERVED_NAMES = setOf(
            "self", "static", "parent", "int", "float", "bool", "string", "array", "callable", "iterable", "object",
            "mixed", "void", "never", "null", "false", "true"
        )
    }
}
