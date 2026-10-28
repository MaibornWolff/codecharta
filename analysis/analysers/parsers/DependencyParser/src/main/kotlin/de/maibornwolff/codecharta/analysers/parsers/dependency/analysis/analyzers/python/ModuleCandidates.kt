package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.python

/** A module path as an import writes it: below the analysis root for a relative import, else absolute. */
internal data class ModuleReference(val path: List<String>, val isRelative: Boolean = false) {
    fun submodule(name: List<String>) = ModuleReference(path + name, isRelative)

    companion object {
        private const val RELATIVE_LEVEL = "."

        /**
         * The module an import path names for the module [modulePath]: one leading `.` segment is the package of the
         * module, every further one its parent. Null for a relative path that reaches the analysis root or beyond.
         */
        fun of(importPath: List<String>, modulePath: List<String>): ModuleReference? {
            val levels = importPath.takeWhile { it == RELATIVE_LEVEL }.size
            if (levels == 0) return ModuleReference(importPath)
            val packagePath = modulePath.dropLast(levels)
            if (packagePath.isEmpty()) return null
            return ModuleReference(packagePath + importPath.drop(levels), isRelative = true)
        }
    }
}

/** The logical module paths a module reference means for a file in [importingFolder]. */
internal class ModuleCandidates(private val modules: PythonModules?, private val importingFolder: List<String>) {
    /**
     * The paths a name and the attribute names behind it, [chain], can have in [module], the likeliest first: in each
     * module the module path means, the deepest declaration first; then, as Python looks for a submodule when a module
     * declares no such name, in the submodule the first name names.
     */
    fun namesIn(module: ModuleReference, chain: List<String>): List<List<String>> {
        val inModule = of(module).flatMap { modulePath -> deepestFirst(modulePath, chain) }
        val submodule = module.submodule(chain.take(1))
        val inSubmodule = if (chain.size > 1 && mayBeModule(submodule)) namesIn(submodule, chain.drop(1)) else emptyList()
        return (inModule + inSubmodule).distinct()
    }

    /** The modules [PythonModules] finds, else the module file and the package of that path. */
    fun of(module: ModuleReference): List<List<String>> =
        found(module).ifEmpty { listOf(module.path, module.path + PythonModules.PACKAGE_FILE) }

    private fun mayBeModule(module: ModuleReference): Boolean = modules == null || found(module).isNotEmpty()

    private fun found(module: ModuleReference): List<List<String>> = when {
        modules == null -> emptyList()
        module.isRelative -> listOfNotNull(modules.moduleAt(module.path))
        else -> modules.modulesOf(module.path, importingFolder)
    }

    companion object {
        /** The paths of a name and the attribute names behind it in [modulePath], the whole chain first. */
        fun deepestFirst(modulePath: List<String>, chain: List<String>): List<List<String>> =
            (chain.size downTo 1).map { modulePath + chain.take(it) }
    }
}
