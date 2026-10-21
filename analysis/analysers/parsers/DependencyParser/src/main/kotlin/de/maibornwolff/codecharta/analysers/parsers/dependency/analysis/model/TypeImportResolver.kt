package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model

import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage

private const val MIN_PACKAGE_PARTS_FOR_SUFFIX_MATCH = 2

internal class TypeImportResolver(
    private val declaration: ImportingDeclaration,
    private val projectDictionary: Map<String, List<Path>>,
    private val languageDictionary: Map<String, Path>
) {
    private val ownPath = declaration.path
    private val dependencies = declaration.dependencies
    private val wildcardImports = dependencies.filter { it.isWildcard }.map { it.path }

    /** The own name means the declaration itself, unless a single-type import names another declaration by it. */
    fun resolveOwnName(plainTypeName: String): Path = findDirectImport(plainTypeName, candidatesNamed(plainTypeName)) ?: ownPath

    fun resolve(fullName: String): Path {
        val plainTypeName = fullName.split(".").last()
        val candidates = candidatesNamed(plainTypeName)
        return findFullyQualified(fullName, candidates)
            ?: findDirectImport(plainTypeName, candidates)
            ?: candidates?.let { findAmongCandidates(fullName, it) }
            ?: languageDictionary[plainTypeName]
            ?: Path.unknown(plainTypeName)
    }

    // Excludes self-references to prevent REEXPORT nodes from depending on themselves
    private fun candidatesNamed(plainTypeName: String): List<Path>? = projectDictionary[plainTypeName]?.filter { it != ownPath }

    // A name written with its full path means that type, whatever an import of the same simple name says
    private fun findFullyQualified(fullName: String, candidates: List<Path>?): Path? =
        if (fullName.contains(".")) candidates?.find { it.withDots() == fullName } else null

    // An explicit import shadows a same-package type of the same name, as Java's single-type import does.
    private fun findDirectImport(plainTypeName: String, candidates: List<Path>?): Path? = dependencies
        .filter { it.isWildcard.not() && it.isDotImport.not() && it.path.parts.lastOrNull() == plainTypeName }
        .firstOrNull { candidates?.contains(it.path) ?: true }
        ?.path

    private fun findAmongCandidates(fullName: String, candidates: List<Path>): Path? = findInSamePackage(candidates)
        ?: findViaDotImport(candidates)
        ?: findViaWildcardImport(fullName, candidates)
        ?: candidates.find { it.withDots() == fullName }
        ?: findViaPackageImport(candidates).takeUnless { importsNameTypesOnly() }
        ?: findViaAlias(candidates)

    private fun findInSamePackage(candidates: List<Path>): Path? {
        val currentPackage = ownPath.withoutName()
        return candidates.find { it.withoutName() == currentPackage }
    }

    private fun findViaDotImport(candidates: List<Path>): Path? = dependencies
        .filter { it.isDotImport }
        .map { it.path }
        .firstNotNullOfOrNull { dotImport -> candidates.find { it.withoutName() == dotImport.parts } }

    private fun findViaWildcardImport(fullName: String, candidates: List<Path>): Path? {
        val fullPath = Path(fullName.split("."))
        return findBelowWildcard(fullPath, candidates)
            ?: findInWildcardPackage(candidates)
            ?: if (fullPath.hasOnlyName()) findContainingWildcard(candidates) else null
    }

    private fun findBelowWildcard(fullPath: Path, candidates: List<Path>): Path? = wildcardImports.firstNotNullOfOrNull { wildcard ->
        val possibleMatch = Path(wildcard.parts + fullPath.parts)
        candidates.find { it.withDots() == possibleMatch.withDots() }
    }

    private fun findInWildcardPackage(candidates: List<Path>): Path? = wildcardImports.firstNotNullOfOrNull { wildcard ->
        candidates.find { it.withoutName() == wildcard.parts }
    }

    private fun findContainingWildcard(candidates: List<Path>): Path? = wildcardImports.firstNotNullOfOrNull { wildcard ->
        candidates.firstOrNull { it.withDots().contains(wildcard.withDots()) }
    }

    // A Java or Kotlin import names one declaration or, with a star, a package; it never makes the members of an imported
    // class visible by their simple names
    private fun importsNameTypesOnly(): Boolean = declaration.language.nameScope == SupportedLanguage.JAVA

    private fun findViaPackageImport(candidates: List<Path>): Path? = dependencies
        .filter { !it.isWildcard && !it.isDotImport }
        .firstNotNullOfOrNull { packageImport ->
            candidates.find { isInImportedPackage(it.withoutName(), packageImport.path.parts) }
        }

    private fun isInImportedPackage(typePackage: List<String>, importPath: List<String>): Boolean =
        typePackage == importPath || endsWithPackage(importPath, typePackage)

    // A single-element package like "api" must not match "github.com/otherproject/api"
    private fun endsWithPackage(importPath: List<String>, typePackage: List<String>): Boolean {
        val isLongEnough = typePackage.size >= MIN_PACKAGE_PARTS_FOR_SUFFIX_MATCH && importPath.size > typePackage.size
        return isLongEnough && importPath.takeLast(typePackage.size) == typePackage
    }

    private fun findViaAlias(candidates: List<Path>): Path? = dependencies.firstNotNullOfOrNull { dependency ->
        candidates.firstOrNull { it.hasAlias(dependency.path) }
    }
}
