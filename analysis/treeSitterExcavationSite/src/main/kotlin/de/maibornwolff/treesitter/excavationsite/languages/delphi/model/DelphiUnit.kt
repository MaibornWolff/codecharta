package de.maibornwolff.treesitter.excavationsite.languages.delphi.model

/**
 * What a Delphi unit, program or library declares, for the name lookup of the dependency parser (`delphi.md`). A name
 * is its segments as written (`Game.Model` is `[Game, Model]`). A program and a library have one `uses` clause, which
 * counts as their implementation `uses`, and their declarations stand in the implementation section: only they
 * themselves can name them.
 */
data class DelphiUnit(
    val kind: DelphiUnitKind,
    val name: List<String>,
    val interfaceUses: List<List<String>>,
    val implementationUses: List<List<String>>,
    val declarations: List<DelphiDeclaration>
)

enum class DelphiUnitKind {
    UNIT,
    PROGRAM,
    LIBRARY
}

enum class DelphiSection {
    INTERFACE,
    IMPLEMENTATION
}

enum class DelphiDeclarationKind {
    CLASS,
    RECORD,
    INTERFACE,

    /** A class or record helper; its [DelphiDeclaration.baseTypes] start with the type it extends. */
    HELPER,
    ENUM,

    /** Any other type: an alias, a pointer, a class reference, a procedural, a set or an array type. */
    TYPE,
    ROUTINE,
    CONSTANT,
    VARIABLE
}

/**
 * A declaration of the unit's top level or, with [outerTypes], a type declared inside a class or record. [members] are
 * the names a class, record, interface or helper declares inside itself (fields, methods, properties, constants, class
 * variables, member types) and the values of an enum; [baseTypes] the base class and interfaces as written, for a
 * helper the type it extends first; [genericParameters] those of the type's own name.
 */
data class DelphiDeclaration(
    val name: String,
    val kind: DelphiDeclarationKind,
    val section: DelphiSection,
    val outerTypes: List<String> = emptyList(),
    val members: List<String> = emptyList(),
    val baseTypes: List<List<String>> = emptyList(),
    val genericParameters: List<String> = emptyList()
)
