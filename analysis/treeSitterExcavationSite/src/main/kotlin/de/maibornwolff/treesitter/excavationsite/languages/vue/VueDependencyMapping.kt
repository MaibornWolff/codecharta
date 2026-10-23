package de.maibornwolff.treesitter.excavationsite.languages.vue

import de.maibornwolff.treesitter.excavationsite.languages.vue.extractors.ComponentExtractor
import de.maibornwolff.treesitter.excavationsite.languages.vue.extractors.ComponentRegistrationExtractor
import de.maibornwolff.treesitter.excavationsite.languages.vue.extractors.ScriptBlockExtractor
import de.maibornwolff.treesitter.excavationsite.shared.domain.ComponentRegistration
import de.maibornwolff.treesitter.excavationsite.shared.domain.EmbeddedSourceMapping
import de.maibornwolff.treesitter.excavationsite.shared.domain.GrammarLibrary
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDependencyMapping
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

object VueDependencyMapping {
    private const val VUE_GRAMMAR = "vue"
    private const val SCRIPT_START = "<script"

    // A component is named after its file, which only the consumer knows. Its imports are those of its script
    // blocks, which come in as embedded sources
    val dependencyMapping = LanguageDependencyMapping(
        extractPackagePath = { emptyList() },
        extractImports = { emptyList() },
        extractDeclarations = ComponentExtractor::extract,
        embeddedSources = EmbeddedSourceMapping(marker = SCRIPT_START, extract = ScriptBlockExtractor::extract),
        grammarOfWholeFile = GrammarLibrary(VUE_GRAMMAR)
    )

    /** The components a JavaScript or TypeScript syntax tree registers, globally or in a `components` option. */
    val extractComponentRegistrations: (SyntaxNode) -> List<ComponentRegistration> = ComponentRegistrationExtractor::extract
}
