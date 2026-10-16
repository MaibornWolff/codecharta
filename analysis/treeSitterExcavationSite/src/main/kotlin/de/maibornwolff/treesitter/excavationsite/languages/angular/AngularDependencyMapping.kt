package de.maibornwolff.treesitter.excavationsite.languages.angular

import de.maibornwolff.treesitter.excavationsite.languages.angular.extractors.TemplateExtractor
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDependencyMapping

// A template has no package and imports nothing; the component it belongs to imports what it uses
internal object AngularDependencyMapping {
    val dependencyMapping = LanguageDependencyMapping(
        extractPackagePath = { emptyList() },
        extractImports = { emptyList() },
        extractDeclarations = TemplateExtractor::extract
    )
}
