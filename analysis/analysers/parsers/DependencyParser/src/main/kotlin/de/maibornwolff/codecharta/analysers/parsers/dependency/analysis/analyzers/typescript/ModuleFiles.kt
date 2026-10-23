package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript

import java.io.File

/**
 * The file a module path means, by "Module specifiers" of `docs/name-resolution/typescript.md`: the path as written
 * when it names a module file, a JavaScript ending finding the TypeScript file of the same name first; else the path
 * with each module ending in order; else the path as a folder, through the file its `package.json` names or its `index`.
 */
internal object ModuleFiles {
    private const val PACKAGE_JSON = "package.json"
    private const val INDEX = "index"
    private val MODULE_ENDINGS = listOf(".ts", ".tsx", ".d.ts", ".mts", ".cts", ".js", ".jsx", ".mjs", ".cjs")
    private val WRITTEN_ENDINGS = MODULE_ENDINGS + ".vue"
    private val TYPESCRIPT_ENDINGS_OF = mapOf(
        ".js" to listOf(".ts", ".tsx"),
        ".jsx" to listOf(".tsx"),
        ".mjs" to listOf(".mts"),
        ".cjs" to listOf(".cts")
    )

    fun fileAt(path: File): File? = writtenFile(path) ?: withEnding(path) ?: folderModule(path)

    private fun writtenFile(path: File): File? {
        val ending = WRITTEN_ENDINGS.filter { path.name.endsWith(it) }.maxByOrNull { it.length } ?: return null
        val stem = path.path.dropLast(ending.length)
        val typescriptFirst = TYPESCRIPT_ENDINGS_OF[ending].orEmpty().map { File(stem + it) }
        return (typescriptFirst + path).firstOrNull { it.isFile }
    }

    private fun withEnding(path: File): File? = MODULE_ENDINGS.map { File(path.path + it) }.firstOrNull { it.isFile }

    private fun folderModule(folder: File): File? {
        if (!folder.isDirectory) return null
        val entry = PackageJson.read(folder.resolve(PACKAGE_JSON))?.entry()?.let { folder.resolve(it).normalize() }
        val fromEntry = entry?.let { if (it.isFile) it else withEnding(it) ?: indexOf(it) }
        return fromEntry ?: indexOf(folder)
    }

    private fun indexOf(folder: File): File? = if (folder.isDirectory) withEnding(folder.resolve(INDEX)) else null
}
