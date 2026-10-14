package de.maibornwolff.treesitter.excavationsite.languages.kotlin.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

internal object KotlinNames {
    private const val SIMPLE_IDENTIFIER = "simple_identifier"
    private const val NAVIGATION_EXPRESSION = "navigation_expression"
    private const val NAVIGATION_SUFFIX = "navigation_suffix"
    private const val SEPARATOR = "."

    fun isUppercase(name: String): Boolean = name.firstOrNull()?.isUpperCase() == true

    /**
     * The name a dotted path stands for: the whole path when it starts with a type (`Outer.Inner`), the package
     * plus the first type when it starts with a package (`com.example.Target.Inner` -> `com.example.Target`).
     * A path without a type names none.
     */
    fun typeNameOf(segments: List<String>): String? {
        if (segments.isEmpty()) return null
        if (isUppercase(segments.first())) return segments.joinToString(SEPARATOR)
        val firstTypeIndex = segments.indexOfFirst { isUppercase(it) }
        if (firstTypeIndex < 0) return null
        return segments.take(firstTypeIndex + 1).joinToString(SEPARATOR)
    }

    /** The segments of `a.b.C` written as identifiers only; null for any other expression, such as `a().b`. */
    fun segmentsOf(expression: SyntaxNode): List<String>? = when (expression.type) {
        SIMPLE_IDENTIFIER -> listOf(expression.text.trim())
        NAVIGATION_EXPRESSION -> navigationSegments(expression)
        else -> null
    }

    private fun navigationSegments(navigation: SyntaxNode): List<String>? {
        val receiver = segmentsOf(navigation.getNamedChild(0)) ?: return null
        val member = navigation
            .children()
            .firstOrNull { it.type == NAVIGATION_SUFFIX }
            ?.children()
            ?.firstOrNull { it.type == SIMPLE_IDENTIFIER }
            ?: return null
        return receiver + member.text.trim()
    }
}
