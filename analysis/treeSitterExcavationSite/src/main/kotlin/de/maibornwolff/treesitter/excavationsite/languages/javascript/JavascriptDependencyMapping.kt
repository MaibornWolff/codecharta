package de.maibornwolff.treesitter.excavationsite.languages.javascript

import de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors.BundlerAliasExtractor
import de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors.DeclarationExtractor
import de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors.ImportExtractor
import de.maibornwolff.treesitter.excavationsite.shared.domain.BundlerAlias
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDependencyMapping
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

internal object JavascriptDependencyMapping {
    val dependencyMapping = LanguageDependencyMapping(
        extractPackagePath = { emptyList() }, // JS/TS have no package declarations
        extractImports = ImportExtractor::extract,
        extractDeclarations = DeclarationExtractor::extract
    )

    val extractBundlerAliases: (SyntaxNode) -> List<BundlerAlias> = BundlerAliasExtractor::extract
}
