package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.python

/** A module path as an import writes it: below the analysis root for a relative import, else absolute. */
internal data class ModuleReference(val path: List<String>, val isRelative: Boolean = false) {
    fun submodule(name: List<String>) = ModuleReference(path + name, isRelative)
}

/** The logical module paths a module reference means for a file in [importingFolder]. */
internal class ModuleCandidates(private val modules: PythonModules?, private val importingFolder: List<String>) {
    /** The modules [PythonModules] finds, else the module file and the package of that path. */
    fun of(module: ModuleReference): List<List<String>> =
        found(module).ifEmpty { listOf(module.path, module.path + PythonModules.PACKAGE_FILE) }

    /** The modules [PythonModules] finds for a module reference, none without them. */
    fun found(module: ModuleReference): List<List<String>> = when {
        modules == null -> emptyList()
        module.isRelative -> listOfNotNull(modules.moduleAt(module.path))
        else -> modules.modulesOf(module.path, importingFolder)
    }
}
