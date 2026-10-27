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
    val declarations: List<DelphiDeclaration>,
    val script: DelphiScript? = null
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
 * helper the type it extends first; [genericParameters] those of the type's own name. [names] are what the declaration
 * writes, in its own text and, for a class or record, in the bodies of its methods; a member type writes its own.
 */
data class DelphiDeclaration(
    val name: String,
    val kind: DelphiDeclarationKind,
    val section: DelphiSection,
    val outerTypes: List<String> = emptyList(),
    val members: List<String> = emptyList(),
    val baseTypes: List<List<String>> = emptyList(),
    val genericParameters: List<String> = emptyList(),
    val names: List<DelphiName> = emptyList()
)

/** The code outside every declaration: a program's main block, a unit's `initialization` and `finalization`. */
data class DelphiScript(val names: List<DelphiName>)

/**
 * A name as written, `Game.Model.TCreature` or `TCreature.Create`, up to the first segment that is no plain identifier;
 * what follows a call or an index (`Spawn.Free`) is a member of a value and not part of it. A name a local declaration
 * of the routine around it hides (a parameter, `Result`, `Self`, a local variable, constant, type or routine, a generic
 * parameter) is left out, ignoring case as the compiler does. [section] is where the name stands, [memberScope] the
 * type, with the types around it, whose members the name sees first (inside a method body or a type declaration).
 */
data class DelphiName(
    val segments: List<String>,
    val section: DelphiSection,
    val memberScope: List<String> = emptyList(),
    val isAttribute: Boolean = false
)
