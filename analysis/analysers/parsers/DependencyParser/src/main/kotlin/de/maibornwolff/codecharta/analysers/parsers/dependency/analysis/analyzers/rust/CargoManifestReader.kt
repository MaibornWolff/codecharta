package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.rust

/**
 * Reads a `Cargo.toml` line by line into a [CargoManifest]: tables and `key = value` lines, a value as a quoted string
 * or an inline table. That covers the tables and keys Cargo writes, each on a line of its own; a value spread over
 * several lines is not read.
 */
internal object CargoManifestReader {
    private val TABLE = Regex("""^\[\s*([^\[\]]+?)\s*]$""")
    private val ARRAY_TABLE = Regex("""^\[\[\s*([^\[\]]+?)\s*]]$""")
    private val KEY_VALUE = Regex("""^([A-Za-z0-9_.\-"']+)\s*=\s*(.+)$""")
    private val STRING = Regex("""^["'](.*)["']$""")
    private val PACKAGE_KEY = Regex("""\bpackage\s*=\s*["']([^"']+)["']""")
    private const val PACKAGE = "package"
    private const val WORKSPACE_PACKAGE = "workspace.package"
    private const val LIBRARY = "lib"
    private const val NAME = "name"
    private const val PATH = "path"
    private const val EDITION = "edition"
    private const val INHERITED_EDITION = "edition.workspace"
    private const val DEPENDENCIES = "dependencies"
    private const val COMMENT = '#'
    private const val TRUE = "true"

    fun parse(text: String): CargoManifest {
        val state = State()
        text.lines().map { stripComment(it).trim() }.filter { it.isNotEmpty() }.forEach { read(it, state) }
        return state.manifest()
    }

    private fun read(line: String, state: State) {
        ARRAY_TABLE.find(line)?.let { match ->
            state.table = match.groupValues[1]
            CargoTargetKind.ofTable(state.table)?.let { state.targets.add(CargoTarget(it)) }
            return
        }
        TABLE.find(line)?.let { match ->
            state.table = match.groupValues[1]
            return
        }
        val keyValue = KEY_VALUE.find(line) ?: return
        readKey(keyValue.groupValues[1], keyValue.groupValues[2].trim(), state)
    }

    private fun readKey(key: String, value: String, state: State) {
        val table = state.table
        when {
            table == PACKAGE -> readPackageKey(key, value, state)
            table == WORKSPACE_PACKAGE && key == EDITION -> state.workspaceEdition = stringOf(value)
            table == LIBRARY && key == NAME -> state.libraryName = stringOf(value)
            table == LIBRARY && key == PATH -> state.libraryPath = stringOf(value)
            CargoTargetKind.ofTable(table) != null -> readTargetKey(key, value, state)
            isDependencyTable(table) -> PACKAGE_KEY.find(value)?.let { state.renames[unquoted(key)] = it.groupValues[1] }
            isDependencyEntry(table) && key == PACKAGE -> stringOf(value)?.let { state.renames[table.substringAfterLast('.')] = it }
        }
    }

    private fun readPackageKey(key: String, value: String, state: State) {
        when (key) {
            NAME -> state.packageName = stringOf(value)
            EDITION -> state.edition = stringOf(value)
            INHERITED_EDITION -> state.inheritsEdition = value == TRUE
        }
    }

    private fun readTargetKey(key: String, value: String, state: State) {
        val last = state.targets.lastOrNull() ?: return
        when (key) {
            NAME -> state.targets[state.targets.lastIndex] = last.copy(name = stringOf(value))
            PATH -> state.targets[state.targets.lastIndex] = last.copy(path = stringOf(value))
        }
    }

    // `[dependencies]`, `[dev-dependencies]`, `[target.'cfg(unix)'.dependencies]`
    private fun isDependencyTable(table: String): Boolean = table.split('.').last().endsWith(DEPENDENCIES)

    // `[dependencies.gm]`
    private fun isDependencyEntry(table: String): Boolean {
        val parts = table.split('.')
        return parts.size >= 2 && parts[parts.size - 2].endsWith(DEPENDENCIES)
    }

    private fun stripComment(line: String): String {
        var quote: Char? = null
        line.forEachIndexed { index, character ->
            when {
                quote != null && character == quote -> quote = null
                quote == null && (character == '"' || character == '\'') -> quote = character
                quote == null && character == COMMENT -> return line.substring(0, index)
            }
        }
        return line
    }

    private fun stringOf(value: String): String? = STRING.find(value.trim())?.groupValues?.get(1)

    private fun unquoted(key: String): String = key.trim().removeSurrounding("\"").removeSurrounding("'")

    private class State {
        var table = ""
        var packageName: String? = null
        var edition: String? = null
        var inheritsEdition = false
        var workspaceEdition: String? = null
        var libraryName: String? = null
        var libraryPath: String? = null
        val targets = mutableListOf<CargoTarget>()
        val renames = LinkedHashMap<String, String>()

        fun manifest() = CargoManifest(
            packageName,
            edition,
            inheritsEdition,
            workspaceEdition,
            libraryName,
            libraryPath,
            targets.toList(),
            renames.toMap()
        )
    }
}
