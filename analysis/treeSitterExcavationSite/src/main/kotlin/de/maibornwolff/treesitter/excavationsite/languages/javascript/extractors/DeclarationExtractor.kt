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
        val names = DeclarationPrepass.moduleNamesOf(rootNode, imports)
        val declarations = rootNode
            .children()
            .flatMap { child ->
                when (child.type) {
                    EXPORT_STATEMENT -> extractFromExportStatement(
                        child,
                        names = names
                    )
                    AMBIENT_DECLARATION -> extractFromAmbientDeclaration(
                        child,
                        names = names
                    ) +
                        declarationsOf(
                            child
                        ).flatMap { extractFromNode(it, names = names) }
                    in DECLARATION_NODE_TYPES -> extractFromNode(
                        child,
                        names = names
                    )
                    else -> emptyList()
                }
            }.filter { it.name.isNotBlank() }
            .toList()
            .withExportVisibility(ExportedNames.of(rootNode))
        return declarations + listOfNotNull(defaultExportOf(rootNode, names))
    }

    // A default export that names a declaration is a re-export of that name; an anonymous one a declaration of its own
    private fun defaultExportOf(rootNode: SyntaxNode, names: ModuleNames): Declaration? =
        when (val shape = DefaultExportClassifier.classify(rootNode)) {
            is DefaultExport.Named -> Declaration(DEFAULT_EXPORT, DeclarationType.REEXPORT, setOf(UsedType(shape.name)))
            is DefaultExport.Reexport -> Declaration(DEFAULT_EXPORT, DeclarationType.REEXPORT, setOf(UsedType(shape.name)))
            is DefaultExport.Anonymous -> {
                val usedTypes = DefaultExportClassifier
                    .anonymousValue(
                        rootNode
                    )?.let { UsedTypeExtractor.extract(it, names) }
                Declaration(DEFAULT_EXPORT, shape.type, usedTypes.orEmpty())
            }
            DefaultExport.None -> null
        }

    // A top-level declaration that its module does not export only its own file can name
    private fun List<Declaration>.withExportVisibility(exported: ExportedNames): List<Declaration> = map { declaration ->
        val isTopLevel = declaration.parentPath.isEmpty() && declaration.type != DeclarationType.REEXPORT
        if (isTopLevel) declaration.copy(isFileScoped = exported.isFileScoped(declaration.name)) else declaration
    }

    private fun extractFromAmbientDeclaration(node: SyntaxNode, names: ModuleNames): List<Declaration> {
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
                    EXPORT_STATEMENT -> extractFromExportStatement(child, parentPath, names)
                    else -> declarationsOf(child).flatMap { extractFromNode(it, parentPath, names) }
                }
            }.filter { it.name.isNotBlank() }
            .toList()
    }

    private fun extractFromExportStatement(
        node: SyntaxNode,
        parentPath: List<String> = emptyList(),
        names: ModuleNames
    ): List<Declaration> = if (hasSource(node) || hasExportClause(node)) {
        ReexportDeclarationExtractor.extract(node)
    } else {
        extractDecoratedDeclarations(node, parentPath, names)
    }

    // The decorators of an exported class are children of the export statement, not of the class declaration
    private fun extractDecoratedDeclarations(node: SyntaxNode, parentPath: List<String>, names: ModuleNames): List<Declaration> {
        val decorators = node.children().filter { it.type == DECORATOR }.toList()
        val decoratorUsedTypes = decorators
            .flatMap { UsedTypeExtractor.extract(it, names).toList() }
            .toSet()
        val angular = AngularDecoratorExtractor.extract(decorators.asSequence())
        return node
            .children()
            .flatMap { declarationsOf(it) }
            .flatMap { extractFromNode(it, parentPath, names) }
            .map { decl -> decl.copy(usedTypes = decl.usedTypes + decoratorUsedTypes, angular = decl.angular ?: angular) }
            .toList()
    }

    private fun extractFromNode(node: SyntaxNode, parentPath: List<String> = emptyList(), names: ModuleNames): List<Declaration> =
        when (node.type) {
            LEXICAL_DECLARATION, VARIABLE_DECLARATION -> extractVariableDeclarations(
                node,
                parentPath,
                names
            )
            INTERNAL_MODULE -> {
                val name = extractDeclarationName(node)
                listOf(Declaration(name = name, type = DeclarationType.UNKNOWN, usedTypes = emptySet(), parentPath = parentPath))
            }
            else -> {
                val name = extractDeclarationName(node)
                val type = declarationType(node.type)
                val usedTypes = UsedTypeExtractor.extract(node, names.without(name))
                val angular = AngularDecoratorExtractor.extract(node.children().filter { it.type == DECORATOR })
                listOf(Declaration(name = name, type = type, usedTypes = usedTypes, parentPath = parentPath, angular = angular))
            }
        }

    private fun extractVariableDeclarations(
        node: SyntaxNode,
        parentPath: List<String> = emptyList(),
        names: ModuleNames
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
                    usedTypes = UsedTypeExtractor.extract(declarator, names.without(name)),
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
