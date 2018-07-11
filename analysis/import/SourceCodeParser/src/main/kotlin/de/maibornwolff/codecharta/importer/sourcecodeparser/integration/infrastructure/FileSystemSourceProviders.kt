package de.maibornwolff.codecharta.importer.sourcecodeparser.integration.infrastructure

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.source.SourceCode
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.source.Language
import de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application.MultiSourceProvider
import de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application.SingleSourceProvider
import de.maibornwolff.codecharta.importer.sourcecodeparser.integration.domain.source.DefaultLanguage
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics.OopLanguage
import java.io.File
import java.nio.file.Files

/**
 * @sourceLocation only an actual FILE is allowed here, FOLDERs are handled by FileSystemMultiSourceProvider
 */
class FileSystemSingleSourceProvider(private val sourceLocation: File): SingleSourceProvider {

    override fun readSource() = resolveOneFile(sourceLocation)

}

class FileSystemMultiSourceProvider(private val sourceLocations: List<File>): MultiSourceProvider {

    override fun readSources() = resolvePath(sourceLocations[0])

    private fun resolvePath(fileOrFolder: File): List<SourceCode> = fileOrFolder
            .walk()
            .filter { it.isFile && languageFor.containsKey(it.extension)}
            .map { resolveOneFile(it) }
            .toList()
}

private val languageFor = mapOf<String, Language>(
        "java" to OopLanguage.JAVA
)

private fun resolveOneFile(file: File): SourceCode {
    return SourceCode(
            languageFor.getOrDefault(file.extension, DefaultLanguage.NONE_FOUND),
            Files.readAllLines(file.toPath())
    )
}