package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.vue

/** The forms of a component name Vue treats as one, `creature-card`, `creatureCard` and `CreatureCard`. */
internal object VueNames {
    private const val KEBAB_SEPARATOR = "-"

    fun pascalCaseOf(name: String): String =
        name.split(KEBAB_SEPARATOR).joinToString("") { word -> word.replaceFirstChar { it.uppercase() } }

    fun camelCaseOf(name: String): String = pascalCaseOf(name).replaceFirstChar { it.lowercase() }
}
