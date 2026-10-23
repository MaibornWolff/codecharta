package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.AliasPathResolver
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.treesitter.excavationsite.api.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.api.ImportKind
import java.io.File

/**
 * The project file an import names, by "Module specifiers" of `docs/name-resolution/typescript.md`: a relative
 * specifier from the folder of the importing file, a bare one through the configured aliases or else the workspace
 * package of that name, then the file [ModuleFiles] finds there. None for a library or a specifier that names no project file.
 */
internal object ImportedModules {
    private const val SEPARATOR = "/"
    private val RELATIVE_STARTS = setOf(".", "..")

    fun fileOf(import: ImportDeclaration, fileInfo: FileInfo): File? {
        val analysisRoot = fileInfo.analysisRoot ?: return null
        val specifier = specifierOf(import)
        if (specifier.isEmpty()) return null
        val target = if (specifier.first() in RELATIVE_STARTS) {
            analysisRoot.resolve(fileInfo.physicalPath).parentFile.resolve(specifier.joinToString(SEPARATOR))
        } else {
            val bareSpecifier = specifier.joinToString(SEPARATOR)
            AliasPathResolver.resolveFile(bareSpecifier, fileInfo) ?: WorkspacePackages.of(analysisRoot).pathOf(bareSpecifier)
                ?: return null
        }
        return ModuleFiles.fileAt(target.normalize())?.takeIf { it.canonicalFile.startsWith(analysisRoot.canonicalFile) }
    }

    /** The logical path of a module file: its path below the analysis root without its last ending. */
    fun logicalPathOf(moduleFile: File, analysisRoot: File): Path {
        val relativePath = moduleFile.canonicalFile.relativeTo(analysisRoot.canonicalFile).invariantSeparatorsPath
        return Path(relativePath.substringBeforeLast('.').split(SEPARATOR))
    }

    /** Whether the import ends with the name it imports out of the module, after its specifier. */
    fun namesMember(import: ImportDeclaration): Boolean =
        !import.isWildcard && (import.kind == ImportKind.MEMBER || import.kind == ImportKind.REEXPORT)

    private fun specifierOf(import: ImportDeclaration): List<String> =
        (if (namesMember(import)) import.path.dropLast(1) else import.path).filter { it.isNotEmpty() }
}
