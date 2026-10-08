package de.maibornwolff.treesitter.excavationsite.languages.php.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.domain.TypeUsage
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType

/**
 * The types a PHP declaration uses and how, in this order: imported constants, base class, interfaces, classes whose
 * constants are read, return types, parameter types, instantiated classes, and with [TypeUsage.USAGE] property
 * types, classes called statically and traits. Only plain names count: a base class, interface or instantiated
 * class written as a qualified name, a union type, a nullable parameter type and the nullable return type of a
 * function are left out. An alias is replaced by
 * the name it stands for.
 *
 * An imported constant counts as used as soon as its name occurs anywhere in the text of the declaration.
 */
internal object UsedTypeExtractor {
    private const val NAME = "name"
    private const val NAMED_TYPE = "named_type"
    private const val OPTIONAL_TYPE = "optional_type"
    private const val CLASS_DECLARATION = "class_declaration"
    private const val DECLARATION_LIST = "declaration_list"
    private const val PROPERTY_DECLARATION = "property_declaration"
    private const val USE_DECLARATION = "use_declaration"
    private const val BASE_CLAUSE = "base_clause"
    private const val CLASS_INTERFACE_CLAUSE = "class_interface_clause"
    private const val OBJECT_CREATION_EXPRESSION = "object_creation_expression"
    private const val SCOPED_CALL_EXPRESSION = "scoped_call_expression"
    private const val CLASS_CONSTANT_ACCESS_EXPRESSION = "class_constant_access_expression"
    private const val FUNCTION_DEFINITION = "function_definition"
    private const val METHOD_DECLARATION = "method_declaration"
    private const val FORMAL_PARAMETERS = "formal_parameters"
    private const val SIMPLE_PARAMETER = "simple_parameter"
    private const val SCOPE_FIELD = "scope"

    private val RELEVANT_TYPES = arrayOf(NAME, NAMED_TYPE, CLASS_CONSTANT_ACCESS_EXPRESSION)

    private enum class Role(val usage: TypeUsage) {
        INHERITED(TypeUsage.INHERITANCE),
        IMPLEMENTED(TypeUsage.IMPLEMENTATION),
        CONSTANT_OWNER(TypeUsage.CONSTANT_ACCESS),
        RETURN_TYPE(TypeUsage.RETURN_VALUE),
        PARAMETER_TYPE(TypeUsage.ARGUMENT),
        INSTANTIATED(TypeUsage.INSTANTIATION),
        PROPERTY_TYPE(TypeUsage.USAGE),
        STATIC_CALL_OWNER(TypeUsage.USAGE),
        USED_TRAIT(TypeUsage.USAGE)
    }

    fun extract(declaration: SyntaxNode, namesByAlias: Map<String, String>, importedConstants: List<String>): Set<UsedType> {
        val namesByRole = TreeTraversal
            .findAllDescendantsOfType(declaration, *RELEVANT_TYPES)
            .flatMap { node -> rolesOf(node) }
            .groupBy({ (role, _) -> role }, { (_, name) -> name })
        val declarationText = declaration.text
        val usedConstants = importedConstants
            .filter {
                declarationText.contains(
                    it
                )
            }.map { UsedType(it, usage = TypeUsage.CONSTANT_ACCESS) }
        val usedTypes = Role.entries.flatMap { role ->
            namesByRole[role].orEmpty().map { name -> UsedType(namesByAlias[name.trim()] ?: name, usage = role.usage) }
        }
        return (usedConstants + usedTypes).toCollection(LinkedHashSet())
    }

    private fun rolesOf(node: SyntaxNode): List<Pair<Role, String>> = when (node.type) {
        NAME -> listOfNotNull(roleOfName(node)?.let { it to node.text })
        NAMED_TYPE -> listOfNotNull(roleOfNamedType(node)?.let { it to node.text })
        else -> ownersOfReadConstants(node).map { Role.CONSTANT_OWNER to it }
    }

    private fun roleOfName(name: SyntaxNode): Role? {
        val parent = name.parent
        return when (parent.type) {
            BASE_CLAUSE -> Role.INHERITED.takeIf { parent.parent.type == CLASS_DECLARATION }
            CLASS_INTERFACE_CLAUSE -> Role.IMPLEMENTED.takeIf { parent.parent.type == CLASS_DECLARATION }
            OBJECT_CREATION_EXPRESSION -> Role.INSTANTIATED
            SCOPED_CALL_EXPRESSION -> Role.STATIC_CALL_OWNER.takeIf { parent.getChildByFieldName(SCOPE_FIELD) == name }
            USE_DECLARATION -> Role.USED_TRAIT.takeIf { isMemberOfClass(parent) }
            else -> null
        }
    }

    private fun roleOfNamedType(namedType: SyntaxNode): Role? {
        val parent = namedType.parent
        val isOptional = parent.type == OPTIONAL_TYPE
        val typedNode = if (isOptional) parent.parent else parent
        return when (typedNode.type) {
            PROPERTY_DECLARATION -> Role.PROPERTY_TYPE.takeIf { isMemberOfClass(typedNode) }
            METHOD_DECLARATION -> Role.RETURN_TYPE
            FUNCTION_DEFINITION -> Role.RETURN_TYPE.takeUnless { isOptional }
            SIMPLE_PARAMETER -> Role.PARAMETER_TYPE.takeIf { !isOptional && typedNode.parent.type == FORMAL_PARAMETERS }
            else -> null
        }
    }

    private fun isMemberOfClass(member: SyntaxNode): Boolean {
        val memberList = member.parent
        return memberList.type == DECLARATION_LIST && memberList.parent.type == CLASS_DECLARATION
    }

    // In `Order::LIMIT` both sides are names; the owner is every name that another one follows
    private fun ownersOfReadConstants(constantAccess: SyntaxNode): List<String> =
        TreeTraversal.findAllChildrenTextByType(constantAccess, NAME).dropLast(1)
}
