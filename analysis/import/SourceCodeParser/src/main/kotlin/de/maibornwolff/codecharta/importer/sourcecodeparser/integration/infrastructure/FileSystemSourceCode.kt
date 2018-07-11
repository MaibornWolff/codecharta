package de.maibornwolff.codecharta.importer.sourcecodeparser.integration.infrastructure

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.raw.Language
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.raw.SourceCode
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics.OopLanguage
import java.io.File
import java.nio.file.Files

class FileSystemSourceCode(private val language: Language, private val lines: List<String>): SourceCode {
//    constructor(language: Language, file: File): this(language, Files.readAllLines(file.toPath()))

    override fun lines(): List<String> = lines

    override fun language(): Language = language


}