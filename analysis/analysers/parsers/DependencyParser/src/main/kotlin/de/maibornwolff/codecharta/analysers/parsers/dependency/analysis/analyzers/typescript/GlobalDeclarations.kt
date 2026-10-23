package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.TSE_GLOBAL_SEGMENT
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import java.io.File
import java.util.concurrent.ConcurrentHashMap

/**
 * The global declarations of a project, by rule 3 of "A simple name" in `docs/name-resolution/typescript.md`: the
 * top-level declarations of every script file and those of every `declare global` block, each below its file, read
 * once per analysis root. A file whose text names `import`, `export`, `exports` or `require` and has no
 * `declare global` is a module and is not parsed.
 */
internal class GlobalDeclarations private constructor(private val pathsByName: Map<String, List<Path>>) {
    /** The paths of the global declarations of [name], in the order of their files' paths. */
    fun pathsOf(name: String): List<Path> = pathsByName[name].orEmpty()

    companion object {
        private val MODULE_ENDINGS = setOf("ts", "tsx", "mts", "cts", "js", "jsx", "mjs", "cjs")
        private val MODULE_SYNTAX = Regex("""\b(import|export|exports|require)\b""")
        private const val DECLARE_GLOBAL = "declare global"
        private const val HIDDEN_PREFIX = "."
        private const val NODE_MODULES = "node_modules"
        private val globalsByRoot = ConcurrentHashMap<String, GlobalDeclarations>()

        fun of(analysisRoot: File): GlobalDeclarations = globalsByRoot.computeIfAbsent(analysisRoot.absolutePath) { read(analysisRoot) }

        private fun read(analysisRoot: File): GlobalDeclarations {
            val pathsByName = sourceFilesBelow(analysisRoot)
                .flatMap { file -> globalNamesIn(file).map { name -> name to ImportedModules.logicalPathOf(file, analysisRoot) + name } }
                .groupBy({ (name, _) -> name }, { (_, path) -> path })
            return GlobalDeclarations(pathsByName)
        }

        private fun sourceFilesBelow(analysisRoot: File): List<File> = analysisRoot
            .walkTopDown()
            .onEnter { folder -> folder == analysisRoot || !(folder.name.startsWith(HIDDEN_PREFIX) || folder.name == NODE_MODULES) }
            .filter { it.isFile && it.extension in MODULE_ENDINGS }
            .sortedBy { it.invariantSeparatorsPath }
            .toList()

        private fun globalNamesIn(file: File): List<String> {
            val content = runCatching { file.readText() }.getOrNull() ?: return emptyList()
            if (MODULE_SYNTAX.containsMatchIn(content) && !content.contains(DECLARE_GLOBAL)) return emptyList()
            val result = runCatching { TreeSitterDependencies.analyze(content, ModuleLanguages.tseLanguageOf(file)) }.getOrNull()
            return result?.declarations?.filter { it.parentPath == listOf(TSE_GLOBAL_SEGMENT) }?.map { it.name }.orEmpty()
        }
    }
}
