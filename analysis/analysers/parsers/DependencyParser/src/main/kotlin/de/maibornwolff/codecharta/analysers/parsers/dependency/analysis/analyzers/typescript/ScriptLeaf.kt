package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path

/**
 * The declaration of a module's top-level code outside every declaration, by "Declarations" of
 * `docs/name-resolution/typescript.md` (decision 3): named after the file without its ending plus `.script`.
 */
internal object ScriptLeaf {
    private const val SUFFIX = ".script"

    fun pathIn(modulePath: Path): Path = modulePath + (modulePath.parts.last() + SUFFIX)
}
