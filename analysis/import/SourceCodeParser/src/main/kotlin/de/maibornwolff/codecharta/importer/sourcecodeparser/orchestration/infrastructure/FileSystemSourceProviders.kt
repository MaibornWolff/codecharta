package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.infrastructure

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.source.Language
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.source.SourceCode
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.source.SourceDescriptor
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics.OopLanguage
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application.DetailedSourceProvider
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application.OverviewSourceProvider
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.domain.source.DefaultLanguage
import java.io.File
import java.nio.file.Files

/**
 * @sourceLocation only an actual FILE is allowed here, FOLDERs are handled by FileSystemOverviewSourceProvider
 */
class FileSystemDetailedSourceProvider(private val sourceLocation: File) : DetailedSourceProvider {

    override fun readSource() = resolveOneFile(sourceLocation, sourceLocation)

}

class FileSystemOverviewSourceProvider(private val sourceLocations: List<File>) : OverviewSourceProvider {

    override fun readSources() = resolvePath(sourceLocations[0])

    private fun resolvePath(fileOrFolder: File): List<SourceCode> = fileOrFolder
            .walk()
            .filter { it.isFile && languageFor.containsKey(it.extension) }
            .map { resolveOneFile(it, fileOrFolder) }
            .toList()
}

private val languageFor = mapOf<String, Language>(
        "java" to OopLanguage.JAVA
)

private fun resolveOneFile(file: File, sourceLocation: File): SourceCode {
    val relativePath = sourceLocation.toPath().normalize().relativize(file.parentFile.toPath().normalize()).toString()
    return SourceCode(
            SourceDescriptor(
                    file.name,
                    relativePath,
                    languageFor.getOrDefault(file.extension, DefaultLanguage.NONE_FOUND)
            ),
            Files.readAllLines(file.toPath())
    )
}