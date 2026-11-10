package de.maibornwolff.codecharta.analysers.importers.sbom.packages

import java.net.URLDecoder
import java.nio.charset.StandardCharsets

/**
 * A package URL without qualifiers and subpath, so the same package written by two tools gets the same [key]
 * (`pkg:npm/%40scope/name@1.0.0` and `pkg:npm/@scope/name@1.0.0?arch=x64` both name one package).
 */
data class Purl(val type: String, val namespace: String?, val name: String, val version: String?) {
    val key: String get() = "pkg:$type/" + listOfNotNull(namespace, name).joinToString("/") { encode(it) } +
        version?.let { "@$it" }.orEmpty()

    /** The name the package's own registry knows it by, e.g. `@scope/name` on npm or `group:artifact` on Maven. */
    val packageName: String get() = when {
        namespace == null -> name
        type == MAVEN -> "$namespace:$name"
        else -> "$namespace/$name"
    }

    companion object {
        private const val SCHEME = "pkg:"
        private const val MAVEN = "maven"

        fun parse(purl: String): Purl? {
            if (!purl.startsWith(SCHEME)) return null
            val withoutExtras = purl.removePrefix(SCHEME).substringBefore('#').substringBefore('?').trimStart('/')
            val lastSlash = withoutExtras.lastIndexOf('/')
            val versionSeparator = withoutExtras.lastIndexOf('@').takeIf { it > lastSlash }
            val coordinates = if (versionSeparator == null) withoutExtras else withoutExtras.substring(0, versionSeparator)
            val version = versionSeparator?.let { decode(withoutExtras.substring(it + 1)) }?.ifEmpty { null }
            val segments = coordinates.split('/').filter { it.isNotEmpty() }
            if (segments.size < 2) return null
            val namespace = segments.subList(1, segments.size - 1).joinToString("/") { decode(it) }.ifEmpty { null }
            return Purl(segments.first().lowercase(), namespace, decode(segments.last()), version)
        }

        private fun decode(segment: String): String = URLDecoder.decode(segment.replace("+", "%2B"), StandardCharsets.UTF_8)

        private fun encode(segment: String): String = segment.split('/').joinToString("/") { it.replace("@", "%40") }
    }
}
