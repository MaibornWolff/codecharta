package de.maibornwolff.treesitter.excavationsite.languages.vba.model

/**
 * What a VBA or VB6 module declares, for the name lookup of the dependency parser (`vba.md`). [name] is the module's
 * `VB_Name`, empty when the file has none. [names] are what the module writes outside every declaration, such as an
 * `Implements` line or the parameter types of an event.
 */
data class VbaModule(
    val name: String,
    val kind: VbaModuleKind,
    val declarations: List<VbaDeclaration>,
    val names: List<VbaName> = emptyList()
)

enum class VbaModuleKind {
    /** A `.bas` module: its public declarations are names of the whole project. */
    STANDARD,

    /** A class, form, report or document module, and a VB6 form: an exported file that starts with a `VERSION` line. */
    CLASS
}

enum class VbaDeclarationKind {
    ROUTINE,
    CONSTANT,
    VARIABLE,
    TYPE,
    ENUM
}

/**
 * A module-level declaration. [isPublic] tells whether other modules see it, by its own visibility or the default of
 * its kind; [members] are the fields of a type and the values of an enum; [names] what the declaration writes, the
 * names a parameter, a local declaration, a label or `Me` hides left out, ignoring case as the compiler does. The
 * `Get`, `Let` and `Set` of a property are one declaration.
 */
data class VbaDeclaration(
    val name: String,
    val kind: VbaDeclarationKind,
    val isPublic: Boolean,
    val members: List<String> = emptyList(),
    val names: List<VbaName> = emptyList()
)

enum class VbaNameKind {
    /** A name of the code, as written up to the first member of a value. */
    CODE,

    /** The name of an Access form that `DoCmd.OpenForm` opens or the `Forms` collection names. */
    FORM,

    /** The name of an Access report that `DoCmd.OpenReport` opens or the `Reports` collection names. */
    REPORT
}

/** A name as written, `modOrders.OrderTotal` as `[modOrders, OrderTotal]`, or the name of a form or report. */
data class VbaName(val segments: List<String>, val kind: VbaNameKind = VbaNameKind.CODE)
