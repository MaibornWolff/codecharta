package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors

import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.declarations.DeclarationMerger
import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.declarations.ForwardDeclarationFinder
import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.declarations.InClassDeclarationFinder
import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.declarations.OutOfClassMethodPromoter
import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

internal object DependencyDeclarationExtractor {
    fun extract(rootNode: SyntaxNode): List<Declaration> = DeclarationMerger.merge(
        InClassDeclarationFinder.find(rootNode) +
            OutOfClassMethodPromoter.promote(rootNode)
    ) + ForwardDeclarationFinder.find(rootNode)
}
