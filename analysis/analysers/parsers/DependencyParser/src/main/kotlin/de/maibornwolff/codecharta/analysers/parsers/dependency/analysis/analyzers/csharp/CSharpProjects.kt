package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.csharp

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FilePath
import java.io.File

/** The C# project of a file: the nearest folder at or above it with a `.csproj`; without one, the analysed files are one. */
internal class CSharpProjects(private val analysisRoot: File?) {
    private val projectByFolder = HashMap<List<String>, List<String>>()

    fun projectOf(file: FilePath): List<String> = projectOfFolder(file.segments.dropLast(1))

    private fun projectOfFolder(folder: List<String>): List<String> = projectByFolder.getOrPut(folder) {
        when {
            declaresProject(folder) -> folder
            folder.isEmpty() -> emptyList()
            else -> projectOfFolder(folder.dropLast(1))
        }
    }

    private fun declaresProject(folder: List<String>): Boolean {
        val directory = analysisRoot?.resolve(folder.joinToString(File.separator)) ?: return false
        return directory.listFiles { file -> file.isFile && file.name.endsWith(PROJECT_FILE_SUFFIX) }.orEmpty().isNotEmpty()
    }

    companion object {
        private const val PROJECT_FILE_SUFFIX = ".csproj"
    }
}
