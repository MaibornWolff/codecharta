package de.maibornwolff.codecharta.importer.sourcecodeparser.integration.infrastructure

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.raw.SourceCode
import de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application.LocationResolver
import java.io.File

class FileSystemLocationResolver: LocationResolver {

    override fun resolve(locations: List<String>) = resolvePath(File(locations[0]))

    private fun resolvePath(fileOrFolder: File): List<SourceCode>
        = fileOrFolder.walk()
                .filter { it.isFile && it.extension == "java"}
                .map { resolveOneFile(it) }.toList()

    private fun resolveOneFile(file: File) = FileSystemSourceCode(file)
}