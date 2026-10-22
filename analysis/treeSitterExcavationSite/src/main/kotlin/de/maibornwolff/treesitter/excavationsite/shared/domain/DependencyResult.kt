package de.maibornwolff.treesitter.excavationsite.shared.domain

/** @property embedded what the sources in another language inside the declarations declare, see [EmbeddedSource.owner] */
data class DependencyResult(
    val packagePath: List<String>,
    val imports: List<ImportDeclaration>,
    val declarations: List<Declaration>,
    val embedded: List<EmbeddedDeclarations> = emptyList()
)

/** The declarations of a source in another language inside the declaration named [owner], such as an inline template. */
data class EmbeddedDeclarations(val owner: String, val language: Language, val declarations: List<Declaration>)

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
    val angular: AngularDeclaration? = null,
    val isFileScoped: Boolean = false
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
 * @property namespacePrefix the scope written before the type at the use site (`A::B` for `A::B::Settings`), empty for
 *   unqualified uses; C++ adapters turn it into the wildcard import a `using namespace A::B;` would be
 * @property alternativeName a second name the same use may mean, as `NameAttribute` for a C# attribute `[Name]`
 */
data class UsedType(
    val name: String,
    val genericTypes: List<UsedType> = emptyList(),
    val namespacePrefix: List<String> = emptyList(),
    val usage: TypeUsage = TypeUsage.USAGE,
    val alternativeName: String? = null
) {
    fun isUppercase(): Boolean = name.firstOrNull()?.isUpperCase() == true
}
