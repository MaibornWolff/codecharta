package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model

private const val MIN_PACKAGE_PARTS_FOR_SUFFIX_MATCH = 2

internal class TypeImportResolver(
    private val declaration: ImportingDeclaration,
    private val projectDictionary: Map<String, List<Path>>,
    private val languageDictionary: Map<String, Path>,
    private val fileScopedPaths: FileScopedPaths
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
            ?: candidates?.let { findByImportHeuristics(fullName, it) }
            ?: languageDictionary[plainTypeName]
            ?: Path.unknown(plainTypeName)
    }

    /** The project declaration a name written with its full path means, whatever an import of its simple name says. */
    fun fullyQualifiedOf(fullName: String): Path? = findFullyQualified(fullName, candidatesNamed(fullName.split(".").last()))

    /** The declaration an import that names it explicitly means by its simple name, in the project or outside it. */
    fun directImportOf(plainTypeName: String): Path? = findDirectImport(plainTypeName, candidatesNamed(plainTypeName))

    /** The project declarations of a simple name the declaration can see, without itself, so a re-export node does not depend on itself. */
    fun candidatesNamed(plainTypeName: String): List<Path>? = projectDictionary[plainTypeName]?.filter {
        it != ownPath && fileScopedPaths.isVisible(it, declaration.physicalPath)
    }

    // A name written with its full path means that type, whatever an import of the same simple name says
    private fun findFullyQualified(fullName: String, candidates: List<Path>?): Path? =
        if (fullName.contains(".")) candidates?.find { it.withDots() == fullName } else null

    // An explicit import shadows a same-package type of the same name, as Java's single-type import does.
    private fun findDirectImport(plainTypeName: String, candidates: List<Path>?): Path? = dependencies
        .filter { it.isWildcard.not() && it.isDotImport.not() && it.path.parts.lastOrNull() == plainTypeName }
        .firstOrNull { candidates?.contains(it.path) ?: true }
        ?.path

    private fun findByImportHeuristics(fullName: String, candidates: List<Path>): Path? = findInSamePackage(candidates)
        ?: findViaDotImport(candidates)
        ?: findViaWildcardImport(fullName, candidates)
        ?: candidates.find { it.withDots() == fullName }
        ?: findViaPackageImport(candidates)
        ?: findViaAlias(candidates)

    private fun findInSamePackage(candidates: List<Path>): Path? = candidates.find { it.withoutName() == declaration.ownPackage }

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
