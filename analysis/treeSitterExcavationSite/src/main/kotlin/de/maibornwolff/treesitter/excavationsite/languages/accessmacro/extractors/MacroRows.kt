package de.maibornwolff.treesitter.excavationsite.languages.accessmacro.extractors

/** A `Begin` … `End` row of a macro export, its properties in their order, a string unescaped and joined across its lines. */
internal data class MacroRow(val properties: List<Pair<String, String>>) {
    fun valueOf(name: String): String? = valuesOf(name).firstOrNull()

    fun valuesOf(name: String): List<String> = properties.filter { it.first.equals(name, ignoreCase = true) }.map { it.second }
}

/** Reads the rows of a macro as `SaveAsText` writes it, the lines outside every row (`Version =196611`) left out. */
internal object MacroRows {
    private val PROPERTY = Regex("""^(\w+)\s*=(.*)$""")
    private const val BEGIN = "begin"
    private const val END = "end"
    private const val QUOTE = '"'

    fun read(content: String): List<MacroRow> {
        val lines = content.lines().map { it.trim() }
        val rows = mutableListOf<MacroRow>()
        var properties: MutableList<Pair<String, String>>? = null
        var index = 0
        while (index < lines.size) {
            val line = lines[index++]
            when {
                line.equals(BEGIN, ignoreCase = true) -> properties = mutableListOf()
                line.equals(END, ignoreCase = true) -> properties?.let { rows.add(MacroRow(it)) }.also { properties = null }
                else -> properties?.let { open -> index = readProperty(line, lines, index, open) }
            }
        }
        return rows
    }

    // Returns the index of the line after the property, which may continue over the lines that start with a quote
    private fun readProperty(line: String, lines: List<String>, next: Int, properties: MutableList<Pair<String, String>>): Int {
        val match = PROPERTY.matchEntire(line) ?: return next
        val written = match.groupValues[2].trim()
        if (!written.startsWith(QUOTE)) {
            properties.add(match.groupValues[1] to written)
            return next
        }
        var index = next
        val parts = mutableListOf(written)
        while (index < lines.size && lines[index].startsWith(QUOTE)) parts.add(lines[index++])
        properties.add(match.groupValues[1] to parts.joinToString("") { SaveAsTextStrings.unquote(it) })
        return index
    }
}
