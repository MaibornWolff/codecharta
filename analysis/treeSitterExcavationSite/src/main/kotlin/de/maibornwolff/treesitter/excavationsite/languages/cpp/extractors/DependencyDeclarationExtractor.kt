package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors

import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.declarations.AliasDeclarationFinder
import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.declarations.ForwardDeclarationFinder
import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.declarations.ImplementationParts
import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.declarations.InClassDeclarationFinder
import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.declarations.NamespaceDeclarationFinder
import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.declarations.OutOfClassMethodPromoter
import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.declarations.SpecializationFinder
import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

internal object DependencyDeclarationExtractor {
    fun extract(rootNode: SyntaxNode): List<Declaration> = ImplementationParts.of(
        InClassDeclarationFinder.find(rootNode),
        OutOfClassMethodPromoter.promote(rootNode) + SpecializationFinder.find(rootNode)
    ) +
        ForwardDeclarationFinder.find(rootNode) + AliasDeclarationFinder.find(rootNode) + NamespaceDeclarationFinder.find(rootNode)
}
