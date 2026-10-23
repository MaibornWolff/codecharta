package de.maibornwolff.treesitter.excavationsite.languages.python.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/** The names of the parameters of a Python function or lambda. */
internal object Parameters {
    private const val IDENTIFIER = "identifier"
    private const val DEFAULT_PARAMETER = "default_parameter"
    private const val TYPED_DEFAULT_PARAMETER = "typed_default_parameter"
    private const val TYPED_PARAMETER = "typed_parameter"
    private const val PARAMETERS_FIELD = "parameters"
    private const val NAME_FIELD = "name"
    private val SPLAT_PATTERNS = setOf("list_splat_pattern", "dictionary_splat_pattern")

    fun namesOf(function: SyntaxNode): List<String> {
        val parameters = function.getChildByFieldName(PARAMETERS_FIELD).orNull() ?: return emptyList()
        return parameters.children().flatMap { parameterName(it) }.toList()
    }

    private fun parameterName(parameter: SyntaxNode): Sequence<String> = when (parameter.type) {
        IDENTIFIER -> sequenceOf(parameter.text)
        DEFAULT_PARAMETER, TYPED_DEFAULT_PARAMETER -> listOfNotNull(parameter.getChildByFieldName(NAME_FIELD).orNull()?.text).asSequence()
        TYPED_PARAMETER, in SPLAT_PATTERNS -> parameter.children().flatMap { parameterName(it) }
        else -> emptySequence()
    }
}
