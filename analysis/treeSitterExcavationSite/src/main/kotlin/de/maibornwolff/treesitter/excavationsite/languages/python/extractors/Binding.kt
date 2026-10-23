package de.maibornwolff.treesitter.excavationsite.languages.python.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType

/**
 * What a Python name means where it is used, by "A simple name" of `docs/name-resolution/python.md`. A use of the name
 * followed by attribute names becomes a [UsedType]: the module the name is looked up in as namespace prefix (none for
 * the own module, one `.` segment per leading dot for a relative one), the name and the attributes behind it as name.
 */
internal sealed interface Binding {
    /** The use of the name [head] followed by the attribute names [attributes]; null for one that names no declaration. */
    fun useOf(head: String, attributes: List<String>): UsedType?

    /** A value the code binds as it runs, such as a parameter, a variable of a function or a method. */
    data object Value : Binding {
        override fun useOf(head: String, attributes: List<String>): UsedType? = null
    }

    /** A declaration of the own module, by its path below the module: `Order`, `Order.Line`. */
    data class OwnDeclaration(val path: List<String>) : Binding {
        override fun useOf(head: String, attributes: List<String>) = UsedType(dotted(path + attributes))
    }

    /** The name [name] of the module [module], which `from module import name` binds. */
    data class ImportedName(val module: List<String>, val name: String) : Binding {
        override fun useOf(head: String, attributes: List<String>) = UsedType(dotted(listOf(name) + attributes), namespacePrefix = module)
    }

    /** The module [module] itself, which `import module` binds; a use of it names a declaration only through an attribute. */
    data class ImportedModule(val module: List<String>) : Binding {
        override fun useOf(head: String, attributes: List<String>): UsedType? =
            if (attributes.isEmpty()) null else UsedType(dotted(attributes), namespacePrefix = module)
    }

    /** The public names of the module [module], which `from module import *` binds; whether it binds a name only that module tells. */
    data class Wildcard(val module: List<String>) : Binding {
        override fun useOf(head: String, attributes: List<String>) = UsedType(dotted(listOf(head) + attributes), namespacePrefix = module)
    }
}

private const val SEPARATOR = "."

private fun dotted(segments: List<String>): String = segments.joinToString(SEPARATOR)
