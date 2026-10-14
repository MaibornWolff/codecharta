package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.kotlin

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.BaseLanguageAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.treesitter.excavationsite.api.Declaration
import de.maibornwolff.treesitter.excavationsite.api.DeclarationType
import de.maibornwolff.treesitter.excavationsite.api.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.api.UsedType
import java.io.File

class KotlinAnalyzer(fileInfo: FileInfo) : BaseLanguageAnalyzer(fileInfo) {
    override val language = SupportedLanguage.KOTLIN

    override fun buildPathWithName(packagePath: List<String>, declaration: Declaration): Path =
        Path(packagePath + declaration.parentPath + nameOf(declaration))

    override fun selectUsedTypes(declaration: Declaration, imports: List<ImportDeclaration>): Set<UsedType> {
        val importedPathByAlias = imports
            .mapNotNull { import -> import.bindingName?.let { alias -> alias to import.path.joinToString(PACKAGE_SEPARATOR) } }
            .toMap()
        return declaration.usedTypes.map { it.withAliasesResolved(importedPathByAlias) }.toSet()
    }

    // The full path, not only its last segment, as an alias often exists because another import shares that name
    private fun UsedType.withAliasesResolved(importedPathByAlias: Map<String, String>): UsedType = copy(
        name = importedPathByAlias[name] ?: name,
        genericTypes = genericTypes.map { it.withAliasesResolved(importedPathByAlias) }
    )

    private fun nameOf(declaration: Declaration): String {
        if (declaration.type != DeclarationType.SCRIPT) return declaration.name
        val fileName = File(fileInfo.physicalPath).name
        return fileName.removeSuffix(SCRIPT_ENDING).removeSuffix(SOURCE_ENDING) + SCRIPT_SUFFIX
    }

    companion object {
        private const val SOURCE_ENDING = ".kt"
        private const val SCRIPT_ENDING = ".kts"
        private const val SCRIPT_SUFFIX = ".script"
        private const val PACKAGE_SEPARATOR = "."
    }
}
