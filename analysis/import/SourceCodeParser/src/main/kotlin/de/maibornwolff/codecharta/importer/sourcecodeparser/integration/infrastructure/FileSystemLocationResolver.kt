package de.maibornwolff.codecharta.importer.sourcecodeparser.integration.infrastructure

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.raw.Language
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.raw.SourceCode
import de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application.LocationResolver
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics.OopLanguage
import java.io.File
import java.nio.file.Files

class FileSystemLocationResolver: LocationResolver {

    private val languageFor = mapOf<String, Language>(
            "java" to OopLanguage.JAVA
    )

    override fun resolve(locations: List<String>) = resolvePath(File(locations[0]))

    private fun resolvePath(fileOrFolder: File): List<SourceCode>
        = fileOrFolder.walk()
                .filter { it.isFile && languageFor.containsKey(it.extension)}
                .map { resolveOneFile(it) }.toList()

    private fun resolveOneFile(file: File): FileSystemSourceCode{
        return FileSystemSourceCode(
                languageFor[file.extension]!!,
                Files.readAllLines(file.toPath())
        )
    }
}