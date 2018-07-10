package de.maibornwolff.codecharta.importer.sourcecodeparser.integration.infrastructure

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.raw.SourceCode
import java.io.File
import java.nio.file.Files

class FileSystemSourceCode(private val language: String, private val lines: List<String>): SourceCode {
    constructor(file: File): this(file.extension, Files.readAllLines(file.toPath()))

    override fun lines(): List<String> = lines

    override fun language(): String = language
}