package de.maibornwolff.treesitter.excavationsite.languages.javascript

import de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors.DeclarationExtractor
import de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors.ImportExtractor
import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDependencyMapping
import org.treesitter.TSNode

internal object JavascriptDependencyMapping {
    val dependencyMapping = LanguageDependencyMapping(
        extractPackagePath = { _, _ -> emptyList() }, // JS/TS have no package declarations
        extractImports = ImportExtractor::extract,
        extractDeclarations = { node, code -> extractJsDeclarations(node, code) }
    )

    // Intentional JS/TS divergence: DC's legacy JS analyzer produces both the named declaration
    // AND a DEFAULT_EXPORT copy (same DeclarationType) for `export default function/class Foo`.
    // TypeScript does NOT add the DEFAULT_EXPORT copy. This matches DC main's behavior per language.
    private fun extractJsDeclarations(rootNode: TSNode, sourceCode: String): List<Declaration> {
        val declarations = DeclarationExtractor.extract(rootNode, sourceCode)
        val shape = DeclarationExtractor.classifyDefaultExport(rootNode, sourceCode)
        if (shape !is DeclarationExtractor.DefaultExport.Named) return declarations
        val inlineDecl = declarations.firstOrNull { it.name == shape.name } ?: return declarations
        return declarations + inlineDecl.copy(name = DEFAULT_EXPORT)
    }
}
