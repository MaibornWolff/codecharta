package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.usedtypes

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.domain.ancestors

/**
 * Rule 1 of the simple-name lookup of `cpp.md`: a written name that means a template parameter of an enclosing template,
 * or a class or alias an enclosing function body declares before it, which no other file can name.
 */
internal object CppLocalNames {
    private const val TEMPLATE_DECLARATION = "template_declaration"
    private const val TEMPLATE_PARAMETER_LIST = "template_parameter_list"
    private const val COMPOUND_STATEMENT = "compound_statement"
    private const val TYPE_IDENTIFIER = "type_identifier"
    private const val NAME_FIELD = "name"
    private const val TYPE_PARAMETER_DECLARATION = "type_parameter_declaration"
    private val LOCAL_TYPE_DECLARATIONS =
        setOf("class_specifier", "struct_specifier", "union_specifier", "enum_specifier", "alias_declaration", "type_definition")

    fun isLocal(occurrence: SyntaxNode, name: String): Boolean = occurrence.ancestors().any { ancestor ->
        (ancestor.type == TEMPLATE_DECLARATION && declaresTemplateParameter(ancestor, name)) ||
            (ancestor.type == COMPOUND_STATEMENT && declaresTypeBefore(ancestor, name, occurrence))
    }

    /** Whether [declaration] lies in a function body, where it is no target. */
    fun isInFunction(declaration: SyntaxNode): Boolean = declaration.ancestors().any { it.type == COMPOUND_STATEMENT }

    private fun declaresTemplateParameter(template: SyntaxNode, name: String): Boolean = template
        .children()
        .filter { it.type == TEMPLATE_PARAMETER_LIST }
        .flatMap { it.namedChildren() }
        .any { parameterNameOf(it) == name }

    // A template template parameter names itself in the inner type parameter that follows its own parameter list
    private fun parameterNameOf(parameter: SyntaxNode): String? = parameter.getChildByFieldName(NAME_FIELD).takeUnless { it.isNull }?.text
        ?: TreeTraversal.findFirstChildTextByType(parameter, TYPE_IDENTIFIER)
        ?: parameter.namedChildren().firstOrNull { it.type == TYPE_PARAMETER_DECLARATION }?.let { parameterNameOf(it) }

    private fun declaresTypeBefore(body: SyntaxNode, name: String, occurrence: SyntaxNode): Boolean = body
        .children()
        .filter { it.type in LOCAL_TYPE_DECLARATIONS && it.startByte < occurrence.startByte }
        .any { declared -> declaredNameOf(declared) == name }

    private fun declaredNameOf(declared: SyntaxNode): String? = declared.getChildByFieldName(NAME_FIELD).takeUnless { it.isNull }?.text
        ?: declared.namedChildren().lastOrNull { it.type == TYPE_IDENTIFIER }?.text
}
