package de.maibornwolff.treesitter.excavationsite.languages.kotlin.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType
import de.maibornwolff.treesitter.excavationsite.shared.domain.ancestors

/**
 * Names a declaration uses as values: an object, a companion or a constant named on its own (`= Single`),
 * a top-level function called by its name (`rollD20()`), a class literal or callable reference (`Dice::class`),
 * and an imported function or property wherever it stands (`creature.toDto()`).
 */
internal object ValueReferenceExtractor {
    private const val SIMPLE_IDENTIFIER = "simple_identifier"
    private const val CALLABLE_REFERENCE = "callable_reference"
    private const val TYPE_IDENTIFIER = "type_identifier"
    private const val CALL_EXPRESSION = "call_expression"
    private const val NAVIGATION_EXPRESSION = "navigation_expression"
    private const val NAVIGATION_SUFFIX = "navigation_suffix"
    private const val VALUE_ARGUMENT = "value_argument"
    private const val INFIX_EXPRESSION = "infix_expression"
    private const val NAMED_ARGUMENT_SIGN = "="
    private const val FUNCTION_DECLARATION = "function_declaration"
    private val TYPE_DECLARATIONS = setOf("class_declaration", "object_declaration")

    // Parents whose identifier is a declared name, a member of something else or part of a header, not a reference
    private val NON_REFERENCE_PARENTS = setOf(
        "variable_declaration",
        "function_declaration",
        "parameter",
        "class_parameter",
        "enum_entry",
        "identifier",
        "type_alias",
        "label"
    )

    fun extract(declaration: SyntaxNode, importedNames: Set<String>): List<UsedType> {
        val buckets = TreeTraversal
            .findAllDescendantsGroupedByType(declaration, setOf(SIMPLE_IDENTIFIER, CALLABLE_REFERENCE))
            .mapValues { (_, nodes) -> nodes.filter { KotlinScopes.belongsTo(it, declaration) } }
        val memberFunctions = memberFunctionNames(declaration)
        val identifiers = buckets[SIMPLE_IDENTIFIER].orEmpty()
        val references = identifiers.mapNotNull { referencedName(it, importedNames, memberFunctions) } +
            buckets[CALLABLE_REFERENCE].orEmpty().flatMap { callableReferenceNames(it, importedNames) }
        return references.map { UsedType(it) }
    }

    // A bare call of a function the outermost class declares, nested classes included, calls that member
    private fun memberFunctionNames(declaration: SyntaxNode): Set<String> {
        val outermostType = (sequenceOf(declaration) + declaration.ancestors()).lastOrNull { it.type in TYPE_DECLARATIONS } ?: declaration
        return TreeTraversal
            .findAllDescendantsOfType(outermostType, FUNCTION_DECLARATION)
            .mapNotNull { function -> function.children().firstOrNull { it.type == SIMPLE_IDENTIFIER }?.text?.trim() }
            .toSet()
    }

    private fun referencedName(identifier: SyntaxNode, importedNames: Set<String>, memberFunctions: Set<String>): String? {
        val name = identifier.text.trim()
        val parent = identifier.parent
        return when {
            parent.type == CALL_EXPRESSION -> name.takeUnless { KotlinNames.isUppercase(it) || it in memberFunctions }
            parent.type == NAVIGATION_SUFFIX || parent.type == NAVIGATION_EXPRESSION -> name.takeIf { it in importedNames }
            parent.type in NON_REFERENCE_PARENTS || isArgumentName(identifier) || isInfixFunctionName(identifier) -> null
            KotlinNames.isUppercase(name) || name in importedNames -> name
            else -> null
        }
    }

    private fun isArgumentName(identifier: SyntaxNode): Boolean {
        val argument = identifier.parent
        if (argument.type != VALUE_ARGUMENT) return false
        val children = argument.children().toList()
        return children.firstOrNull() == identifier && children.getOrNull(1)?.type == NAMED_ARGUMENT_SIGN
    }

    private fun isInfixFunctionName(identifier: SyntaxNode): Boolean {
        val infix = identifier.parent
        if (infix.type != INFIX_EXPRESSION) return false
        val children = infix.children().toList()
        return children.first() != identifier && children.last() != identifier
    }

    private fun callableReferenceNames(reference: SyntaxNode, importedNames: Set<String>): List<String> {
        val receiver = reference.children().filter { it.type == TYPE_IDENTIFIER }.map { it.text.trim() }.toList()
        val member = reference.children().firstOrNull { it.type == SIMPLE_IDENTIFIER }?.text?.trim()
        val receiverType = KotlinNames.typeNameOf(receiver)
        val importedMember = member?.takeIf { it in importedNames }
        return listOfNotNull(receiverType, importedMember)
    }
}
