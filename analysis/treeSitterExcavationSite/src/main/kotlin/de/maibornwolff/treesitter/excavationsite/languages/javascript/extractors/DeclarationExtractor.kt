package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType

private const val AMBIENT_DECLARATION = "ambient_declaration"
private const val MODULE_DECLARATION = "module"
private const val STATEMENT_BLOCK = "statement_block"

internal object DeclarationExtractor {
    fun extract(rootNode: SyntaxNode): List<Declaration> {
        val imports = ImportExtractor.extract(rootNode)
        val aliasMap = DeclarationPrepass.buildAliasMap(imports)
        val localDeclarationNames = DeclarationPrepass.extractLocalDeclarationNames(rootNode)
        val declarations = rootNode
            .children()
            .flatMap { child ->
                when (child.type) {
                    EXPORT_STATEMENT -> extractFromExportStatement(
                        child,
                        aliasMap = aliasMap,
                        localDeclarationNames = localDeclarationNames
                    )
                    AMBIENT_DECLARATION -> extractFromAmbientDeclaration(
                        child,
                        aliasMap = aliasMap,
                        localDeclarationNames = localDeclarationNames
                    )
                    in DECLARATION_NODE_TYPES -> extractFromNode(
                        child,
                        aliasMap = aliasMap,
                        localDeclarationNames = localDeclarationNames
                    )
                    else -> emptyList()
                }
            }.filter { it.name.isNotBlank() }
            .toList()
        return when (val shape = DefaultExportClassifier.classify(rootNode)) {
            is DefaultExport.Reexport -> {
                val resolvedType = declarations.firstOrNull { it.name == shape.name }?.type
                    ?: DeclarationType.REEXPORT
                declarations + Declaration(DEFAULT_EXPORT, resolvedType, setOf(UsedType(shape.name)))
            }
            is DefaultExport.Anonymous, DefaultExport.Value ->
                declarations + Declaration(DEFAULT_EXPORT, DeclarationType.REEXPORT, emptySet())
            is DefaultExport.Named, DefaultExport.None -> declarations
        }
    }

    private fun extractFromAmbientDeclaration(
        node: SyntaxNode,
        aliasMap: Map<String, String>,
        localDeclarationNames: Set<String>
    ): List<Declaration> {
        val moduleNode = node.children().firstOrNull { it.type == MODULE_DECLARATION } ?: return emptyList()
        val moduleName = moduleNode
            .children()
            .firstOrNull { it.type == STRING }
            ?.children()
            ?.firstOrNull { it.type == STRING_FRAGMENT }
            ?.text
            ?.trim()
            ?: return emptyList()
        if (moduleName.contains("*")) return emptyList()
        val parentPath = moduleName.split("/")
        val body = moduleNode.children().firstOrNull { it.type == STATEMENT_BLOCK } ?: return emptyList()
        return body
            .children()
            .flatMap { child ->
                when (child.type) {
                    EXPORT_STATEMENT -> extractFromExportStatement(child, parentPath, aliasMap, localDeclarationNames)
                    in DECLARATION_NODE_TYPES -> extractFromNode(child, parentPath, aliasMap, localDeclarationNames)
                    else -> emptyList()
                }
            }.filter { it.name.isNotBlank() }
            .toList()
    }

    private fun extractFromExportStatement(
        node: SyntaxNode,
        parentPath: List<String> = emptyList(),
        aliasMap: Map<String, String>,
        localDeclarationNames: Set<String>
    ): List<Declaration> = if (hasSource(node)) {
        ReexportDeclarationExtractor.extract(node)
    } else {
        extractDecoratedDeclarations(node, parentPath, aliasMap, localDeclarationNames)
    }

    // The decorators of an exported class are children of the export statement, not of the class declaration
    private fun extractDecoratedDeclarations(
        node: SyntaxNode,
        parentPath: List<String>,
        aliasMap: Map<String, String>,
        localDeclarationNames: Set<String>
    ): List<Declaration> {
        val decorators = node.children().filter { it.type == DECORATOR }.toList()
        val decoratorUsedTypes = decorators
            .flatMap { UsedTypeExtractor.extract(it, aliasMap, localDeclarationNames).toList() }
            .toSet()
        val angular = AngularDecoratorExtractor.extract(decorators.asSequence())
        return node
            .children()
            .filter { it.type in DECLARATION_NODE_TYPES }
            .flatMap { extractFromNode(it, parentPath, aliasMap, localDeclarationNames) }
            .map { decl -> decl.copy(usedTypes = decl.usedTypes + decoratorUsedTypes, angular = decl.angular ?: angular) }
            .toList()
    }

    private fun extractFromNode(
        node: SyntaxNode,
        parentPath: List<String> = emptyList(),
        aliasMap: Map<String, String>,
        localDeclarationNames: Set<String>
    ): List<Declaration> = when (node.type) {
        LEXICAL_DECLARATION, VARIABLE_DECLARATION -> extractVariableDeclarations(
            node,
            parentPath,
            aliasMap,
            localDeclarationNames
        )
        INTERNAL_MODULE -> {
            val name = extractDeclarationName(node)
            listOf(Declaration(name = name, type = DeclarationType.UNKNOWN, usedTypes = emptySet(), parentPath = parentPath))
        }
        else -> {
            val name = extractDeclarationName(node)
            val type = declarationType(node.type)
            val usedTypes = UsedTypeExtractor.extract(node, aliasMap, localDeclarationNames - name)
            val angular = AngularDecoratorExtractor.extract(node.children().filter { it.type == DECORATOR })
            listOf(Declaration(name = name, type = type, usedTypes = usedTypes, parentPath = parentPath, angular = angular))
        }
    }

    private fun extractVariableDeclarations(
        node: SyntaxNode,
        parentPath: List<String> = emptyList(),
        aliasMap: Map<String, String>,
        localDeclarationNames: Set<String>
    ): List<Declaration> = node
        .children()
        .filter { it.type == VARIABLE_DECLARATOR }
        .mapNotNull { declarator ->
            val name = TreeTraversal.findFirstChildTextByType(declarator, IDENTIFIER)?.trim()
            if (name.isNullOrBlank()) {
                null
            } else {
                Declaration(
                    name = name,
                    type = DeclarationType.VARIABLE,
                    usedTypes = UsedTypeExtractor.extract(declarator, aliasMap, localDeclarationNames - name),
                    parentPath = parentPath
                )
            }
        }.toList()

    private fun declarationType(nodeType: String): DeclarationType = when (nodeType) {
        CLASS_DECLARATION, ABSTRACT_CLASS_DECLARATION, TYPE_ALIAS_DECLARATION -> DeclarationType.CLASS
        INTERFACE_DECLARATION -> DeclarationType.INTERFACE
        ENUM_DECLARATION -> DeclarationType.ENUM
        FUNCTION_DECLARATION, FUNCTION_SIGNATURE, GENERATOR_FUNCTION_DECLARATION -> DeclarationType.FUNCTION
        LEXICAL_DECLARATION, VARIABLE_DECLARATION -> DeclarationType.VARIABLE
        else -> DeclarationType.UNKNOWN
    }
}
