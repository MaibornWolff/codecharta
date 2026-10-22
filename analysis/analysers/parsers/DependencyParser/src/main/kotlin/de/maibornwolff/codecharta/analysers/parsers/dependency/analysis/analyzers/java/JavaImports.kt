package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.java

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path

/**
 * Rules 5 and 6 of `java.md` and `kotlin.md`: a type of the own package, then exactly the packages a star import names,
 * of which two declaring the name make it ambiguous. An import never makes the members of a class visible by their
 * simple names.
 */
internal class JavaImports(private val ownPackage: List<String>, dependencies: Set<Dependency>) {
    private val starPackages = dependencies.filter { it.isWildcard }.map { it.path.parts }.filter { it != ownPackage }

    fun find(candidates: List<Path>): Path? = candidates.find { it.withoutName() == ownPackage }
        ?: candidates.filter { it.withoutName() in starPackages }.distinctBy { it.withDots() }.singleOrNull()
}
