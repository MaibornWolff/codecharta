package de.maibornwolff.treesitter.excavationsite.languages.delphi.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/**
 * The names a routine body declares for itself, in lower case as Delphi ignores case: `Result`, `Self`, parameters,
 * generic parameters, local constants, variables, types, labels and routines, inline and loop variables, exception
 * handler variables. The routines and anonymous methods inside it count as part of it, so what they declare hides a
 * unit name in the whole body.
 */
internal object LocalNames {
    private const val IDENTIFIER = "identifier"
    private const val GENERIC_ARG = "genericArg"
    private const val DEF_PROC = "defProc"
    private const val HEADER_FIELD = "header"
    private const val NAME_FIELD = "name"

    private val IMPLICIT = setOf("result", "self")
    private val DECLARING_ALL_IDENTIFIERS = arrayOf("declArg", "declVar", "varAssignDef", "exceptionHandler")
    private val DECLARING_BY_NAME = arrayOf("declConst", "declType", "declLabel", GENERIC_ARG)

    fun of(body: SyntaxNode): Set<String> = (IMPLICIT + declaredIn(body)).toSet()

    private fun declaredIn(body: SyntaxNode): List<String> {
        val byIdentifiers = TreeTraversal.findAllDescendantsOfType(body, *DECLARING_ALL_IDENTIFIERS).flatMap { declaredIdentifiers(it) }
        val byName = TreeTraversal.findAllDescendantsOfType(body, *DECLARING_BY_NAME).mapNotNull { nameOf(it) }
        val routines = TreeTraversal.findAllDescendantsOfType(body, DEF_PROC).filter { it != body }.mapNotNull { routineNameOf(it) }
        return (byIdentifiers + byName + routines).map { it.lowercase() }
    }

    // `A, B: Integer` and `on E: EFail` name their identifiers before the type; the type itself is a typeref.
    private fun declaredIdentifiers(declaration: SyntaxNode): List<String> =
        declaration.children().filter { it.type == IDENTIFIER }.map { it.text }.toList()

    private fun nameOf(declaration: SyntaxNode): String? =
        declaration.getChildByFieldName(NAME_FIELD).orNull()?.let { leadingIdentifierOf(it) }

    private fun routineNameOf(routine: SyntaxNode): String? {
        val heading = routine.getChildByFieldName(HEADER_FIELD).orNull() ?: return null
        return heading.getChildByFieldName(NAME_FIELD).orNull()?.takeIf { it.type == IDENTIFIER }?.text
    }

    // A generic type's name (`TBox<T>`) starts with its identifier.
    private fun leadingIdentifierOf(name: SyntaxNode): String? = if (name.type == IDENTIFIER) {
        name.text
    } else {
        TreeTraversal.findAllDescendantsOfType(name, IDENTIFIER).firstOrNull()?.text
    }
}
