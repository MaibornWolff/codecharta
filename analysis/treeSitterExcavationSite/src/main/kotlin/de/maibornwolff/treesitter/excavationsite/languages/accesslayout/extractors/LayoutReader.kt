package de.maibornwolff.treesitter.excavationsite.languages.accesslayout.extractors

import de.maibornwolff.treesitter.excavationsite.languages.accessmacro.extractors.SaveAsTextStrings

/** A property as Access writes it, its string value unescaped and joined across the lines it spans. */
internal data class LayoutProperty(val name: String, val value: String, val lines: Int)

/**
 * A `Begin <type>` block: the form or report itself, a section, a control, a grouping level of a report, or the
 * default [isStyle] of a control type, whose properties no control of the layout has as written.
 */
internal data class LayoutBlock(val type: String, val isControl: Boolean, val isStyle: Boolean, val properties: List<LayoutProperty>) {
    fun valueOf(name: String): String? = properties.firstOrNull { it.name.equals(name, ignoreCase = true) }?.value
}

/**
 * The layout part of a form or report export, the code after `CodeBehindForm` left out; [lines] counts that part. Each
 * of its [embeddedMacros] is the text of a macro an event runs, as a stand-alone macro is exported.
 */
internal data class Layout(val blocks: List<LayoutBlock>, val lines: Int, val embeddedMacros: List<String>)

/**
 * Reads the text Access writes with `SaveAsText` for a form or report: nested `Begin <type>` … `End` blocks of
 * `Name =value` lines. A control is a block inside a section; the blocks outside one are the form and the default
 * styles of the control types. A binary property (`PrtMip = Begin` … `End`) is skipped, an embedded macro
 * (`OnClickEmMacro = Begin` … `End`) read as a text of its own.
 */
internal object LayoutReader {
    private val CODE_BEHIND = Regex("""^CodeBehind(Form|Report)\s*$""", RegexOption.IGNORE_CASE)
    private val BLOCK_START = Regex("""^Begin\s+(\w+)$""", RegexOption.IGNORE_CASE)
    private val PROPERTY = Regex("""^(\w+)\s*=(.*)$""")
    private val NESTED_START = Regex("""^Begin(\s+\w+)?$|=\s*Begin$""", RegexOption.IGNORE_CASE)
    private val EMBEDDED_MACRO_START = Regex("""^\w+EmMacro\s*=\s*Begin$""", RegexOption.IGNORE_CASE)
    private const val ANONYMOUS_START = "begin"
    private const val END = "end"
    private const val QUOTE = '"'
    private val SECTIONS = setOf("formheader", "formfooter", "pageheader", "pagefooter", "section", "breakheader", "breakfooter")
    private const val GROUPING_LEVEL = "breaklevel"

    fun read(content: String): Layout {
        val lines = content.lineSequence().map { it.trim() }.takeWhile { !CODE_BEHIND.matches(it) }.toList()
        val reading = Reading(lines)
        reading.readAll()
        return Layout(reading.blocks, lines.size, reading.embeddedMacros)
    }

    private class OpenBlock(val type: String, val isControl: Boolean, val isSection: Boolean, val isStyle: Boolean) {
        val properties = mutableListOf<LayoutProperty>()
    }

    private class Reading(private val lines: List<String>) {
        val blocks = mutableListOf<LayoutBlock>()
        val embeddedMacros = mutableListOf<String>()
        private val open = ArrayDeque<OpenBlock?>()
        private var index = 0

        fun readAll() {
            while (index < lines.size) readLine(lines[index++])
        }

        private fun readLine(line: String) {
            val blockType = BLOCK_START.matchEntire(line)?.groupValues?.get(1)
            when {
                blockType != null -> openBlock(blockType)
                line.equals(ANONYMOUS_START, ignoreCase = true) -> open.addLast(null)
                line.equals(END, ignoreCase = true) -> closeBlock()
                EMBEDDED_MACRO_START.matches(line) -> embeddedMacros.add(nestedLines().joinToString("\n"))
                NESTED_START.containsMatchIn(line) -> nestedLines()
                else -> PROPERTY.matchEntire(line)?.let { readProperty(it.groupValues[1], it.groupValues[2].trim()) }
            }
        }

        private fun openBlock(type: String) {
            val isInSection = open.any { it?.isSection == true }
            val isSection = type.lowercase() in SECTIONS
            val isStyle = !isInSection && !isSection && open.any { it != null } && !type.equals(GROUPING_LEVEL, ignoreCase = true)
            open.addLast(OpenBlock(type, isControl = isInSection, isSection = isSection, isStyle = isStyle))
        }

        private fun closeBlock() {
            val block = open.removeLastOrNull() ?: return
            blocks.add(LayoutBlock(block.type, block.isControl, block.isStyle, block.properties))
        }

        // Returns the lines inside the nested block, its closing End left out
        private fun nestedLines(): List<String> {
            val start = index
            var depth = 1
            while (depth > 0 && index < lines.size) {
                val line = lines[index++]
                if (line.equals(END, ignoreCase = true)) {
                    depth--
                } else if (NESTED_START.containsMatchIn(line)) {
                    depth++
                }
            }
            return lines.subList(start, if (depth == 0) index - 1 else index)
        }

        private fun readProperty(name: String, written: String) {
            val block = open.lastOrNull { it != null } ?: return
            if (!written.startsWith(QUOTE)) {
                block.properties.add(LayoutProperty(name, written, 1))
                return
            }
            val parts = mutableListOf(written)
            while (index < lines.size && lines[index].startsWith(QUOTE)) parts.add(lines[index++])
            block.properties.add(LayoutProperty(name, parts.joinToString("") { SaveAsTextStrings.unquote(it) }, parts.size))
        }
    }
}
