package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.source.SourceCode
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.source.SourceDescriptor
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics.OopLanguage
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application.DetailedSourceProvider
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application.OverviewSourceProvider
import java.nio.file.Files
import java.nio.file.Paths

class DetailedSourceProviderStub(private val sourceCode: SourceCode): DetailedSourceProvider {
    override fun readSource(): SourceCode = sourceCode

    companion object {
        fun javaLocationResolverFromResource(name: String, location: String): DetailedSourceProviderStub {
            val path = Paths.get(javaClass.classLoader.getResource("$location/$name")!!.toURI())
            val code = Files.readAllLines(path)
            val sourceCode = javaSource(name, location, code)
            return DetailedSourceProviderStub(sourceCode)
        }
    }
}

class OverviewSourceProviderStub(private val sourceCodes: List<SourceCode>): OverviewSourceProvider {
    override fun readSources(): List<SourceCode> = sourceCodes
}

fun javaSource(name: String, location: String, code: List<String>): SourceCode {
    return SourceCode(SourceDescriptor(name, location, OopLanguage.JAVA), code)
}