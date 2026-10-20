package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.model.DirectImport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.model.Import
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.model.RelativeImport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import java.io.File

// `./myModule` imported in /path/to/file.ts resolves to /path/to/myModule, `../myModule` to /path/myModule
fun resolveRelativePath(import: Import, filePath: Path): Path {
    if (import is DirectImport) {
        return Path(import.directPath.split("/"))
    }
    var importParts = (import as RelativeImport).relativePath.split("/")
    val firstPathPart = importParts.first()
    if (firstPathPart == ".") {
        return Path(filePath.parts.dropLast(1) + importParts.drop(1))
    }
    var filePathParts = filePath.parts.dropLast(1)
    while (importParts.first() == "..") {
        importParts = importParts.drop(1)
        filePathParts = filePathParts.dropLast(1)
    }
    return Path(filePathParts + importParts)
}

fun Path.withoutFileSuffix(fileSuffix: String): Path {
    val suffixWithDot = ".$fileSuffix"
    this
        .getName()
        .endsWith(suffixWithDot, ignoreCase = true)
        .let {
            val fileNameWithoutSuffix = if (it) this.parts.last().dropLast(suffixWithDot.length) else this.parts.last()
            return Path(this.parts.dropLast(1) + fileNameWithoutSuffix)
        }
}

// Node paths have their source extension stripped, so the import paths have to match them
fun String.stripSourceFileExtension(): String {
    val extension = SOURCE_FILE_EXTENSIONS.firstOrNull { endsWith(it, ignoreCase = true) } ?: return this
    return dropLast(extension.length)
}

private val SOURCE_FILE_EXTENSIONS = listOf(".vue", ".tsx", ".jsx", ".mts", ".cts", ".mjs", ".cjs", ".ts", ".js")

fun toRelativePath(absolutePath: File, analysisRoot: File, stripExtension: Boolean = false): Path {
    val relativePath = makeRelativeToAnalysisRoot(absolutePath.canonicalFile, analysisRoot.canonicalFile)
    val finalPath = if (stripExtension) relativePath.stripSourceFileExtension() else relativePath
    return Path(finalPath.split("/").filter { it.isNotEmpty() })
}

private fun makeRelativeToAnalysisRoot(absolutePath: File, analysisRoot: File): String {
    val path = absolutePath.invariantSeparatorsPath
    val root = analysisRoot.invariantSeparatorsPath.removeSuffix("/")

    return when {
        path == root -> ""
        path.startsWith("$root/") -> path.substring(root.length + 1)
        else -> path.removePrefix("/")
    }
}
