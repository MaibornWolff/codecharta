package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType

private const val MODULE_DECLARATION = "module"
private const val STATEMENT_BLOCK = "statement_block"
private const val GLOBAL_KEYWORD = "global"

internal object DeclarationExtractor {
    fun extract(rootNode: SyntaxNode): List<Declaration> {
        val imports = ImportExtractor.extract(rootNode)
        val names = DeclarationPrepass.moduleNamesOf(rootNode, imports)
        val exportedNames = ExportedNames.of(rootNode)
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
                    ) + extractFromGlobalBlock(child, names) +
                        declarationsOf(
                            child
                        ).flatMap { extractFromNode(it, names = names) }
                    else -> declarationsOf(child).flatMap { extractFromNode(it, names = names) }
                }
            }.filter { it.name.isNotBlank() }
            .toList()
            .withExportVisibility(exportedNames)
            .let { if (exportedNames.isScript) it.inGlobalScope() else it }
        return declarations + listOfNotNull(defaultExportOf(rootNode, names), TopLevelCode.scriptOf(rootNode, names))
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

    // The top-level declarations of a script file are global (rule 3), as no module encloses them
    private fun List<Declaration>.inGlobalScope(): List<Declaration> = map { declaration ->
        val isTopLevel = declaration.parentPath.isEmpty() && declaration.type != DeclarationType.REEXPORT
        if (isTopLevel) declaration.copy(parentPath = listOf(GLOBAL_SCOPE)) else declaration
    }

    // `declare global { … }` declares global names in a module (rule 3)
    private fun extractFromGlobalBlock(node: SyntaxNode, names: ModuleNames): List<Declaration> {
        if (node.children().none { it.type == GLOBAL_KEYWORD }) return emptyList()
        val body = node.children().firstOrNull { it.type == STATEMENT_BLOCK } ?: return emptyList()
        return extractFromBlock(body, listOf(GLOBAL_SCOPE), names)
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
        val parentPath = listOf(AMBIENT_MODULE) + moduleName.split("/")
        val body = moduleNode.children().firstOrNull { it.type == STATEMENT_BLOCK } ?: return emptyList()
        return extractFromBlock(body, parentPath, names)
    }

    private fun extractFromBlock(body: SyntaxNode, parentPath: List<String>, names: ModuleNames): List<Declaration> = body
        .children()
        .flatMap { child ->
            when (child.type) {
                EXPORT_STATEMENT -> extractFromExportStatement(child, parentPath, names)
                else -> declarationsOf(child).flatMap { extractFromNode(it, parentPath, names) }
            }
        }.filter { it.name.isNotBlank() }
        .toList()

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
            INTERNAL_MODULE -> NamespaceDeclarations.extract(node, parentPath, names) { statement, memberPath ->
                extractFromExportStatement(statement, memberPath, names)
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
        .flatMap { declarator ->
            BindingPatterns.declaredNames(declarator).filter { it.isNotBlank() }.map { name ->
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
