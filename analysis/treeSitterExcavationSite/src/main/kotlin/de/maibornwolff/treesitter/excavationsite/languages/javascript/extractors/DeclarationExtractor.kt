package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType

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
                    ) +
                        declarationsOf(
                            child
                        ).flatMap { extractFromNode(it, aliasMap = aliasMap, localDeclarationNames = localDeclarationNames) }
                    in DECLARATION_NODE_TYPES -> extractFromNode(
                        child,
                        aliasMap = aliasMap,
                        localDeclarationNames = localDeclarationNames
                    )
                    else -> emptyList()
                }
            }.filter { it.name.isNotBlank() }
            .toList()
            .withExportVisibility(ExportedNames.of(rootNode))
        return declarations + listOfNotNull(defaultExportOf(rootNode, aliasMap, localDeclarationNames))
    }

    // A default export that names a declaration is a re-export of that name; an anonymous one a declaration of its own
    private fun defaultExportOf(rootNode: SyntaxNode, aliasMap: Map<String, String>, localDeclarationNames: Set<String>): Declaration? =
        when (val shape = DefaultExportClassifier.classify(rootNode)) {
            is DefaultExport.Named -> Declaration(DEFAULT_EXPORT, DeclarationType.REEXPORT, setOf(UsedType(shape.name)))
            is DefaultExport.Reexport -> Declaration(DEFAULT_EXPORT, DeclarationType.REEXPORT, setOf(UsedType(shape.name)))
            is DefaultExport.Anonymous -> {
                val usedTypes = DefaultExportClassifier
                    .anonymousValue(
                        rootNode
                    )?.let { UsedTypeExtractor.extract(it, aliasMap, localDeclarationNames) }
                Declaration(DEFAULT_EXPORT, shape.type, usedTypes.orEmpty())
            }
            DefaultExport.None -> null
        }

    // A top-level declaration that its module does not export only its own file can name
    private fun List<Declaration>.withExportVisibility(exported: ExportedNames): List<Declaration> = map { declaration ->
        val isTopLevel = declaration.parentPath.isEmpty() && declaration.type != DeclarationType.REEXPORT
        if (isTopLevel) declaration.copy(isFileScoped = exported.isFileScoped(declaration.name)) else declaration
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
                    else -> declarationsOf(child).flatMap { extractFromNode(it, parentPath, aliasMap, localDeclarationNames) }
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
            .flatMap { declarationsOf(it) }
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
