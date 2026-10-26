package de.maibornwolff.treesitter.excavationsite.languages.php.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.domain.TypeUsage
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType

/**
 * The names a PHP declaration uses and how, in the order of [Role], each as the full path of the class, function or
 * constant it means by the rules of `php.md`: the last segment as name, the namespace as prefix, and for a function or
 * constant PHP may look up globally the global name as fallback. Read are every type (parameter, return, property,
 * `catch`), the base classes and interfaces of a class, an interface, an enum or an anonymous class, instantiations,
 * static calls and properties, constant accesses, traits, attributes, the class of an `instanceof`, function calls and
 * constant reads; left out are `self`, `static`, `parent` and the type keywords.
 */
internal object UsedTypeExtractor {
    private const val NAME = "name"
    private const val QUALIFIED_NAME = "qualified_name"
    private const val NAMED_TYPE = "named_type"
    private const val CLASS_DECLARATION = "class_declaration"
    private const val ANONYMOUS_CLASS = "anonymous_class"
    private const val DECLARATION_LIST = "declaration_list"
    private const val PROPERTY_DECLARATION = "property_declaration"
    private const val USE_DECLARATION = "use_declaration"
    private const val BASE_CLAUSE = "base_clause"
    private const val CLASS_INTERFACE_CLAUSE = "class_interface_clause"
    private const val OBJECT_CREATION_EXPRESSION = "object_creation_expression"
    private const val SCOPED_CALL_EXPRESSION = "scoped_call_expression"
    private const val SCOPED_PROPERTY_ACCESS_EXPRESSION = "scoped_property_access_expression"
    private const val ATTRIBUTE = "attribute"
    private const val BINARY_EXPRESSION = "binary_expression"
    private const val CLASS_CONSTANT_ACCESS_EXPRESSION = "class_constant_access_expression"
    private const val RETURN_TYPE_FIELD = "return_type"
    private val TYPE_COMPOSITIONS = setOf("optional_type", "union_type", "intersection_type", "disjunctive_normal_form_type", "type_list")
    private val PARAMETERS = setOf("simple_parameter", "property_promotion_parameter", "variadic_parameter")
    private const val SCOPE_FIELD = "scope"
    private const val FUNCTION_FIELD = "function"
    private const val FUNCTION_CALL_EXPRESSION = "function_call_expression"

    private val RELEVANT_TYPES = arrayOf(NAME, QUALIFIED_NAME, NAMED_TYPE, CLASS_CONSTANT_ACCESS_EXPRESSION)
    private val CLASS_NAMES = setOf(NAME, QUALIFIED_NAME)

    private enum class Kind { CLASS, FUNCTION, CONSTANT }

    // The order of the entries is the order of the used types
    private enum class Role(val usage: TypeUsage, val kind: Kind = Kind.CLASS) {
        CONSTANT_READ(TypeUsage.CONSTANT_ACCESS, Kind.CONSTANT),
        INHERITED(TypeUsage.INHERITANCE),
        IMPLEMENTED(TypeUsage.IMPLEMENTATION),
        CONSTANT_OWNER(TypeUsage.CONSTANT_ACCESS),
        RETURN_TYPE(TypeUsage.RETURN_VALUE),
        PARAMETER_TYPE(TypeUsage.ARGUMENT),
        INSTANTIATED(TypeUsage.INSTANTIATION),
        PROPERTY_TYPE(TypeUsage.USAGE),
        OTHER_TYPE(TypeUsage.USAGE),
        STATIC_MEMBER_OWNER(TypeUsage.USAGE),
        USED_TRAIT(TypeUsage.USAGE),
        ATTRIBUTE(TypeUsage.USAGE),
        CHECKED_INSTANCE(TypeUsage.USAGE),
        ANONYMOUS_CLASS_HEADER(TypeUsage.USAGE),
        CALLED_FUNCTION(TypeUsage.USAGE, Kind.FUNCTION)
    }

    fun extract(declaration: SyntaxNode, blocks: List<NamespaceBlock>): Set<UsedType> {
        val namesByRole = TreeTraversal
            .findAllDescendantsOfType(declaration, *RELEVANT_TYPES)
            .flatMap { node -> rolesOf(node) }
            .groupBy({ (role, _) -> role }, { (_, name) -> name })
        val usedTypes = Role.entries.flatMap { role ->
            namesByRole[role].orEmpty().mapNotNull { name -> usedTypeOf(name, role, blocks) }
        }
        return usedTypes.toCollection(LinkedHashSet())
    }

    private fun usedTypeOf(name: SyntaxNode, role: Role, blocks: List<NamespaceBlock>): UsedType? {
        val names = NamespaceBlocks.blockOf(name, blocks)?.names ?: return null
        val written = name.text.trim()
        return when (role.kind) {
            Kind.CLASS -> names.classPath(written)?.let { usedType(it, role.usage) }
            Kind.FUNCTION -> usedType(names.functionUse(written), role.usage)
            Kind.CONSTANT -> usedType(names.constantUse(written), role.usage)
        }
    }

    private fun usedType(use: PhpNames.Use, usage: TypeUsage): UsedType =
        usedType(use.path, usage).copy(fallbacks = listOfNotNull(use.fallback?.let { usedType(it, usage) }))

    private fun usedType(path: List<String>, usage: TypeUsage) = UsedType(path.last(), namespacePrefix = path.dropLast(1), usage = usage)

    private fun rolesOf(node: SyntaxNode): List<Pair<Role, SyntaxNode>> = when (node.type) {
        NAME, QUALIFIED_NAME -> listOfNotNull(roleOfName(node)?.let { it to node })
        NAMED_TYPE -> listOf(roleOfNamedType(node) to node)
        else -> ownersOfReadConstants(node).map { Role.CONSTANT_OWNER to it }
    }

    private fun roleOfName(name: SyntaxNode): Role? {
        val parent = name.parent
        return when (parent.type) {
            BASE_CLAUSE -> if (isOfAnonymousClass(parent)) Role.ANONYMOUS_CLASS_HEADER else Role.INHERITED
            CLASS_INTERFACE_CLAUSE -> if (isOfAnonymousClass(parent)) Role.ANONYMOUS_CLASS_HEADER else Role.IMPLEMENTED
            OBJECT_CREATION_EXPRESSION -> Role.INSTANTIATED
            SCOPED_CALL_EXPRESSION, SCOPED_PROPERTY_ACCESS_EXPRESSION ->
                Role.STATIC_MEMBER_OWNER.takeIf { parent.getChildByFieldName(SCOPE_FIELD) == name }
            ATTRIBUTE -> Role.ATTRIBUTE
            BINARY_EXPRESSION -> if (ConstantReads.isInstanceofClass(name)) Role.CHECKED_INSTANCE else Role.CONSTANT_READ
            USE_DECLARATION -> Role.USED_TRAIT.takeIf { isMemberOfClass(parent) }
            FUNCTION_CALL_EXPRESSION -> Role.CALLED_FUNCTION.takeIf { parent.getChildByFieldName(FUNCTION_FIELD) == name }
            else -> Role.CONSTANT_READ.takeIf { ConstantReads.isRead(name) }
        }
    }

    // The node a type belongs to, above the nullable, union and intersection types it is part of
    private fun roleOfNamedType(namedType: SyntaxNode): Role {
        var type = namedType
        while (type.parent.type in TYPE_COMPOSITIONS) type = type.parent
        val typedNode = type.parent
        return when {
            typedNode.type in PARAMETERS -> Role.PARAMETER_TYPE
            typedNode.getChildByFieldName(RETURN_TYPE_FIELD) == type -> Role.RETURN_TYPE
            typedNode.type == PROPERTY_DECLARATION -> Role.PROPERTY_TYPE
            else -> Role.OTHER_TYPE
        }
    }

    private fun isOfAnonymousClass(clause: SyntaxNode): Boolean = clause.parent.type == ANONYMOUS_CLASS

    private fun isMemberOfClass(member: SyntaxNode): Boolean {
        val memberList = member.parent
        return memberList.type == DECLARATION_LIST && memberList.parent.type == CLASS_DECLARATION
    }

    // In `Order::LIMIT` both sides are names: the first is the owner
    private fun ownersOfReadConstants(constantAccess: SyntaxNode): List<SyntaxNode> {
        val sides = constantAccess.namedChildren().toList()
        return listOfNotNull(sides.first().takeIf { sides.size > 1 && it.type in CLASS_NAMES })
    }
}
