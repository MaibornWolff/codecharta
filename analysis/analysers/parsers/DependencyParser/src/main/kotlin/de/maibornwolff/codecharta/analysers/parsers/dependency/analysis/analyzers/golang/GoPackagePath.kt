package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.golang

/**
 * The path Go files import a package by follows its directory, not the name in its package clause, so the
 * directory of the file is the package path. The declared names decide only for a file without a directory.
 */
object GoPackagePath {
    private const val MAIN_PACKAGE = "main"
    private const val UNKNOWN_PACKAGE = "unknown"
    private const val WINDOWS_SEPARATOR = "\\"
    private const val SEPARATOR = "/"
    private const val CURRENT_DIRECTORY = '.'
    private const val FILE_ENDING_MARK = "."

    fun derive(filePath: String, declaredPackageNames: List<String>): List<String> {
        val directoryParts = directoryPartsOf(filePath)
        if (directoryParts.isNotEmpty()) return directoryParts
        return when {
            declaredPackageNames.isEmpty() -> listOf(UNKNOWN_PACKAGE)
            declaredPackageNames.first() == MAIN_PACKAGE -> listOf(MAIN_PACKAGE)
            else -> declaredPackageNames
        }
    }

    private fun directoryPartsOf(filePath: String): List<String> {
        val relativePath = filePath.replace(WINDOWS_SEPARATOR, SEPARATOR).trimStart(CURRENT_DIRECTORY, SEPARATOR.single())
        val pathParts = relativePath.split(SEPARATOR).filter { it.isNotEmpty() }
        val endsWithFileName = pathParts.isNotEmpty() && pathParts.last().contains(FILE_ENDING_MARK)
        return if (endsWithFileName) pathParts.dropLast(1) else pathParts
    }
}
