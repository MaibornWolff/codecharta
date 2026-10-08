package de.maibornwolff.treesitter.excavationsite.languages.vue

import de.maibornwolff.treesitter.excavationsite.languages.vue.extractors.ComponentExtractor
import de.maibornwolff.treesitter.excavationsite.languages.vue.extractors.ScriptBlockExtractor
import de.maibornwolff.treesitter.excavationsite.shared.domain.GrammarLibrary
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDependencyMapping

object VueDependencyMapping {
    // A component is named after its file, which only the consumer knows, and imports through its script blocks
    val dependencyMapping = LanguageDependencyMapping(
        extractPackagePath = { emptyList() },
        extractImports = { emptyList() },
        extractDeclarations = ComponentExtractor::extract,
        extractEmbeddedSources = ScriptBlockExtractor::extract,
        grammarOfWholeFile = GrammarLibrary("vue")
    )
}
