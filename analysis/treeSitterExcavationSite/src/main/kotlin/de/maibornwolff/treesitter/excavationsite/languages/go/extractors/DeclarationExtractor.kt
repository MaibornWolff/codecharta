package de.maibornwolff.treesitter.excavationsite.languages.go.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/**
 * Functions and type declarations are the declarations of a Go file. A method is none of its own: what it uses is
 * added to the first declaration that carries the name of its receiver type.
 *
 * A type declaration is named after its first type spec, so of a group `type ( A …; B … )` only `A` is found, and a
 * declaration without one, such as the alias `type A = B`, is named [UNNAMED].
 */
internal object DeclarationExtractor {
    private const val TYPE_DECLARATION = "type_declaration"
    private const val FUNCTION_DECLARATION = "function_declaration"
    private const val METHOD_DECLARATION = "method_declaration"
    private const val TYPE_SPEC = "type_spec"
    private const val INTERFACE_TYPE = "interface_type"
    private const val PARAMETER_DECLARATION = "parameter_declaration"
    private const val TYPE_IDENTIFIER = "type_identifier"
    private const val POINTER_TYPE = "pointer_type"
    private const val NAME_FIELD = "name"
    private const val TYPE_FIELD = "type"
    private const val RECEIVER_FIELD = "receiver"
    private const val UNNAMED = "unknown"

    fun extract(rootNode: SyntaxNode): List<Declaration> {
        val (methods, others) = TreeTraversal
            .findAllDescendantsOfType(rootNode, TYPE_DECLARATION, FUNCTION_DECLARATION, METHOD_DECLARATION)
            .partition { it.type == METHOD_DECLARATION }
        val declarations = others.map { toDeclaration(it) }.toMutableList()
        methods.forEach { method -> addUsedTypesToReceiverType(method, declarations) }
        return declarations
    }

    private fun toDeclaration(declaration: SyntaxNode): Declaration {
        if (declaration.type == FUNCTION_DECLARATION) {
            val name = declaration.getChildByFieldName(NAME_FIELD).orNull()?.text ?: UNNAMED
            return Declaration(name, DeclarationType.FUNCTION, UsedTypeExtractor.extract(declaration))
        }
        val typeSpec = declaration.children().firstOrNull { it.type == TYPE_SPEC }
        val name = typeSpec?.getChildByFieldName(NAME_FIELD)?.orNull()?.text ?: UNNAMED
        val isInterface = typeSpec?.getChildByFieldName(TYPE_FIELD)?.orNull()?.type == INTERFACE_TYPE
        val type = if (isInterface) DeclarationType.INTERFACE else DeclarationType.CLASS
        return Declaration(name, type, UsedTypeExtractor.extract(declaration))
    }

    private fun addUsedTypesToReceiverType(method: SyntaxNode, declarations: MutableList<Declaration>) {
        val receiverTypeName = receiverTypeName(method) ?: return
        val receiverIndex = declarations.indexOfFirst { it.name == receiverTypeName }
        if (receiverIndex < 0) return
        val receiver = declarations[receiverIndex]
        declarations[receiverIndex] = receiver.copy(usedTypes = receiver.usedTypes + UsedTypeExtractor.extract(method))
    }

    // A generic receiver such as `(s *Stack[T])` has no plain type identifier, so its methods are left out
    private fun receiverTypeName(method: SyntaxNode): String? {
        val receiver = method.getChildByFieldName(RECEIVER_FIELD).orNull() ?: return null
        val parameter = receiver.children().firstOrNull { it.type == PARAMETER_DECLARATION } ?: return null
        val type = parameter.children().firstOrNull { it.type == TYPE_IDENTIFIER || it.type == POINTER_TYPE } ?: return null
        if (type.type == TYPE_IDENTIFIER) return type.text
        return type.namedChildren().firstOrNull()?.takeIf { it.type == TYPE_IDENTIFIER }?.text
    }
}
