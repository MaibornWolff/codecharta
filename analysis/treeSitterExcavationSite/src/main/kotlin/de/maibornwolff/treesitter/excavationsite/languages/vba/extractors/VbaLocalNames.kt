package de.maibornwolff.treesitter.excavationsite.languages.vba.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/** The names that hide a module or project name, in lower case as VBA ignores case: `Me`, and in a routine its locals. */
internal class VbaLocalNames private constructor(private val names: Set<String>) {
    fun hides(name: String): Boolean = name.lowercase() in names

    companion object {
        private const val PARAMETER = "parameter"
        private const val VARIABLE_DECLARATOR = "variable_declarator"
        private const val CONST_DECLARATOR = "const_declarator"
        private const val NAME_FIELD = "name"
        private const val ME = "me"

        val MODULE = VbaLocalNames(setOf(ME))

        /** The parameters of [routine] and what its body declares with `Dim`, `Static` and `Const`. */
        fun of(routine: SyntaxNode): VbaLocalNames {
            val declared = TreeTraversal
                .findAllDescendantsOfType(routine, PARAMETER, VARIABLE_DECLARATOR, CONST_DECLARATOR)
                .mapNotNull { it.getChildByFieldName(NAME_FIELD).orNull()?.text?.lowercase() }
            return VbaLocalNames(declared.toSet() + ME)
        }
    }
}
