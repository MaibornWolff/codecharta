package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.vue

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript.ModuleImports
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript.ModuleLanguages
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import java.io.File
import java.util.concurrent.ConcurrentHashMap

/**
 * The components a project registers globally, for Vue tag rule 4 of `docs/name-resolution/typescript.md`:
 * `app.component('CreatureBadge', Badge)` registers the component `Badge` names in that file under the name
 * `CreatureBadge`, written in kebab case too; read once per run, only from the files whose text has such a call.
 */
internal class GlobalComponents private constructor(private val pathsByName: Map<String, Set<Path>>) {
    /** The path of the one component registered as [name], none where the project registers several or none. */
    fun onlyOneNamed(name: String): Path? = pathsByName[name]?.singleOrNull()

    companion object {
        private const val REGISTERING_CALL = ".component("
        private const val VUE_ENDING = ".vue"
        private val SCRIPT_ENDINGS = setOf("ts", "tsx", "mts", "cts", "js", "jsx", "mjs", "cjs", "vue")
        private val componentsByRun = ConcurrentHashMap<Pair<String, Set<String>>, GlobalComponents>()

        fun of(analysisRoot: File, analysedFiles: Set<String>): GlobalComponents =
            componentsByRun.computeIfAbsent(analysisRoot.absolutePath to analysedFiles) { read(analysisRoot, analysedFiles) }

        private fun read(analysisRoot: File, analysedFiles: Set<String>): GlobalComponents {
            val pathsByName = ProjectFiles
                .pathsOf(analysisRoot, analysedFiles)
                .filter { it.substringAfterLast('.') in SCRIPT_ENDINGS }
                .sorted()
                .flatMap { registrationsIn(analysisRoot, it) }
                .groupBy({ (name, _) -> name }, { (_, path) -> path })
                .mapValues { (_, paths) -> paths.toSet() }
            return GlobalComponents(pathsByName)
        }

        private fun registrationsIn(analysisRoot: File, physicalPath: String): List<Pair<String, Path>> {
            val content = runCatching { analysisRoot.resolve(physicalPath).readText() }.getOrNull() ?: return emptyList()
            if (!content.contains(REGISTERING_CALL)) return emptyList()
            val isVue = physicalPath.endsWith(VUE_ENDING)
            val tseLanguage = if (isVue) Language.VUE else ModuleLanguages.tseLanguageOf(File(physicalPath))
            val registrations = runCatching { TreeSitterDependencies.vueComponentRegistrations(content, tseLanguage) }
                .getOrNull()
                ?.filter { it.isGlobal }
                .orEmpty()
            if (registrations.isEmpty()) return emptyList()
            val language = if (isVue) SupportedLanguage.VUE else ModuleLanguages.languageOf(File(physicalPath))
            val moduleImports = ModuleImports(FileInfo(language, physicalPath, content, analysisRoot))
            val imports = runCatching { TreeSitterDependencies.analyze(content, tseLanguage).imports }.getOrNull().orEmpty()
            return registrations.mapNotNull { registration ->
                val import = imports.firstOrNull { it.boundName() == registration.binding } ?: return@mapNotNull null
                moduleImports.dependencyOf(import)?.let { VueNames.pascalCaseOf(registration.name) to it.path }
            }
        }
    }
}
