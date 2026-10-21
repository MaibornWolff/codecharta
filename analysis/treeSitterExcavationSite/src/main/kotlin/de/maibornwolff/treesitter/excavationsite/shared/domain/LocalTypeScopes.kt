package de.maibornwolff.treesitter.excavationsite.shared.domain

/**
 * Where a written type name means a type of the code around it rather than a declaration another file can name: a type
 * parameter of an enclosing declaration, or a local class declared earlier in an enclosing block.
 */
internal class LocalTypeScopes(
    private val typeParameterOwners: Set<String>,
    private val isBlock: (SyntaxNode) -> Boolean,
    private val localClass: String,
    private val nameOf: (SyntaxNode) -> String?
) {
    fun isLocal(occurrence: SyntaxNode, name: String): Boolean = occurrence.ancestors().any { ancestor ->
        (ancestor.type in typeParameterOwners && declaresTypeParameter(ancestor, name)) ||
            (isBlock(ancestor) && declaresLocalClassBefore(ancestor, name, occurrence))
    }

    fun isLocalClass(declaration: SyntaxNode): Boolean = declaration.ancestors().any { isBlock(it) }

    private fun declaresTypeParameter(owner: SyntaxNode, name: String): Boolean = owner
        .children()
        .filter { it.type == TYPE_PARAMETERS }
        .flatMap { it.children() }
        .filter { it.type == TYPE_PARAMETER }
        .any { parameter -> parameter.children().firstOrNull { it.type in PARAMETER_NAMES }?.text == name }

    private fun declaresLocalClassBefore(block: SyntaxNode, name: String, occurrence: SyntaxNode): Boolean = block
        .children()
        .any { it.type == localClass && it.startByte < occurrence.startByte && nameOf(it) == name }

    companion object {
        private const val TYPE_PARAMETERS = "type_parameters"
        private const val TYPE_PARAMETER = "type_parameter"
        private val PARAMETER_NAMES = setOf("type_identifier", "identifier")
    }
}
