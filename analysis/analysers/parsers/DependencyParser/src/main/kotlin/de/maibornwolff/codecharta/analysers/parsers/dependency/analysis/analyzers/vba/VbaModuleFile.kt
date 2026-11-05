package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.vba

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.common.splitNameToParts
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FilePath
import de.maibornwolff.treesitter.excavationsite.api.VbaDeclaration
import de.maibornwolff.treesitter.excavationsite.api.VbaDeclarationKind
import de.maibornwolff.treesitter.excavationsite.api.VbaModule
import de.maibornwolff.treesitter.excavationsite.api.VbaModuleKind

/**
 * A module of the run and the file it is written in, named by its `VB_Name` or else its file name. A standard module's
 * declarations lie below the module name, everything a class module declares is the class itself (`vba.md`).
 */
internal class VbaModuleFile(val file: String, val module: VbaModule) {
    val name: String = module.name.ifEmpty { file.substringAfterLast('/').substringBeforeLast('.') }
    val isClass: Boolean = module.kind == VbaModuleKind.CLASS
    val filePath: FilePath = FilePath(splitNameToParts(file).filter { it != CURRENT_DIRECTORY })

    private val byName = module.declarations.associateBy { it.name.lowercase() }
    private val enumsByValue = module.declarations
        .filter { it.kind == VbaDeclarationKind.ENUM }
        .flatMap { enum -> enum.members.map { it.lowercase() to enum } }
        .toMap()

    /** The declaration [written] means in this module, ignoring case: one of its own names or the enum of a value. */
    fun declarationNamed(written: String): VbaDeclaration? = byName[written.lowercase()] ?: enumsByValue[written.lowercase()]

    /** The declarations other modules see by their name alone, with the enum each value of a public enum means. */
    fun publicNames(): List<Pair<String, VbaDeclaration>> {
        val visible = module.declarations.filter { it.isPublic && (!isClass || it.kind == VbaDeclarationKind.ENUM) }
        val enumValues = visible.filter { it.kind == VbaDeclarationKind.ENUM }.flatMap { enum -> enum.members.map { it to enum } }
        return visible.map { it.name to it } + enumValues
    }

    fun pathOf(declaration: VbaDeclaration): List<String> = if (isClass) listOf(name) else listOf(name, declaration.name)

    companion object {
        private const val CURRENT_DIRECTORY = "."
    }
}
