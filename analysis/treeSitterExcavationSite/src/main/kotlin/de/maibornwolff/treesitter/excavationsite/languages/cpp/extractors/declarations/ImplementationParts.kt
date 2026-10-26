package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.declarations

import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration

/**
 * Decision 3 of `cpp.md`: member functions defined outside their class's file form an implementation part of the class,
 * reported below [IMPLEMENTATION] plus the class's path; those defined in the file of the class body belong to it.
 */
internal object ImplementationParts {
    const val IMPLEMENTATION = "IMPLEMENTATION"

    fun of(bodies: List<Declaration>, outOfClass: List<Declaration>): List<Declaration> {
        val bodyPaths = bodies.mapTo(HashSet()) { it.parentPath + it.name }
        val (ofOwnBodies, implementations) = outOfClass.partition { (it.parentPath + it.name) in bodyPaths }
        return DeclarationMerger.merge(bodies + ofOwnBodies) +
            DeclarationMerger.merge(implementations).map { it.copy(parentPath = listOf(IMPLEMENTATION) + it.parentPath) }
    }
}
