package de.maibornwolff.treesitter.excavationsite.languages.php.extractors

/**
 * What a name written in a namespace block means, by the rules of `php.md`: the full path of a class, or of a function
 * or constant together with the global path PHP falls back to at runtime.
 */
internal class PhpNames(private val namespace: List<String>, private val imports: PhpImports) {
    /** @property fallback the global name an unqualified, unimported function or constant falls back to, if any */
    class Use(val path: List<String>, val fallback: List<String>? = null)

    /** The class a name means, null for `self`, `static`, `parent` and the type keywords. */
    fun classPath(written: String): List<String>? {
        val segments = segmentsOf(written)
        if (segments.size == 1 && segments.single().lowercase() in RESERVED_NAMES) return null
        return pathOf(written, segments) { imports.classPath(it) }
    }

    fun functionUse(written: String): Use = memberUse(written) { imports.functionPath(it) }

    fun constantUse(written: String): Use = memberUse(written) { imports.constantPath(it) }

    // A qualified function or constant name goes through the class and namespace imports, as a class name does
    private fun memberUse(written: String, imported: (String) -> List<String>?): Use {
        val segments = segmentsOf(written)
        if (segments.size > 1 || written.startsWith(SEPARATOR)) return Use(pathOf(written, segments) { imports.classPath(it) })
        val name = segments.single()
        imported(name)?.let { return Use(it) }
        return Use(namespace + name, fallback = listOf(name).takeIf { namespace.isNotEmpty() })
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
