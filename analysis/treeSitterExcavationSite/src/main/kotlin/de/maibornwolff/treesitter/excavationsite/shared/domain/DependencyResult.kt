package de.maibornwolff.treesitter.excavationsite.shared.domain

data class DependencyResult(val packagePath: List<String>, val imports: List<ImportDeclaration>, val declarations: List<Declaration>)

enum class ImportKind {
    STANDARD,
    INCLUDE,
    REEXPORT,

    /**
     * A name imported out of a module (Python `from module import name`): the last path segment is that name, for a
     * wildcard there is none. A relative module starts with one `.` segment per leading dot.
     */
    MEMBER
}

data class ImportDeclaration(
    val path: List<String>,
    val isWildcard: Boolean,
    val namespacePath: List<String> = emptyList(),
    val kind: ImportKind = ImportKind.STANDARD,
    val bindingName: String? = null
)

enum class DeclarationType {
    CLASS,
    INTERFACE,
    ENUM,
    RECORD,
    ANNOTATION,
    FUNCTION,
    VARIABLE,
    REEXPORT,

    /** A file that declares nothing: it has no name of its own and carries what the file uses. */
    SCRIPT,
    UNKNOWN
}

/** @property angular what the Angular decorator of a class declares, null for a declaration without one */
data class Declaration(
    val name: String,
    val type: DeclarationType,
    val usedTypes: Set<UsedType>,
    val parentPath: List<String> = emptyList(),
    val angular: AngularDeclaration? = null
)

/** How a declaration uses a type, for the languages whose extractor tells the ways apart; [USAGE] is any other way. */
enum class TypeUsage {
    USAGE,
    INHERITANCE,
    IMPLEMENTATION,
    CONSTANT_ACCESS,
    RETURN_VALUE,
    INSTANTIATION,
    ARGUMENT
}

/**
 * A type referenced inside a declaration body.
 *
 * `namespacePrefix` holds the namespace or scope segments that were written
 * alongside the type at the use site (e.g. `A::B` for `A::B::Settings`). It
 * is empty for unqualified uses. This slot exists for languages like C++
 * where fully-qualified inline type references are idiomatic; Java / Kotlin
 * / C# code typically imports types at the top of the file and uses short
 * names inline, so their extractors leave it empty.
 *
 * Adapters that consume `UsedType` may use `namespacePrefix` to synthesize
 * wildcard imports per qualified usage, which feeds the resolver the same
 * hint a `using namespace A::B;` directive would.
 */
data class UsedType(
    val name: String,
    val genericTypes: List<UsedType> = emptyList(),
    val namespacePrefix: List<String> = emptyList(),
    val usage: TypeUsage = TypeUsage.USAGE
) {
    fun isUppercase(): Boolean = name.firstOrNull()?.isUpperCase() == true
}
