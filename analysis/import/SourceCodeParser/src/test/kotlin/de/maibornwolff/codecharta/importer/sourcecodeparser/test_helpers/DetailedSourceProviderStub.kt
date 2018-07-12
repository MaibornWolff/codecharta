package de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.source.SourceCode
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.source.SourceDescriptor
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics.OopLanguage
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application.DetailedSourceProvider
import java.nio.file.Files
import java.nio.file.Paths

class DetailedSourceProviderStub(private val sourceCode: SourceCode): DetailedSourceProvider {
    override fun readSource(): SourceCode = sourceCode

    companion object {
        fun javaLocationResolverFromResource(name: String, location: String): DetailedSourceProviderStub {
            val path = Paths.get(DetailedSourceProviderStub::class.java.classLoader.getResource("$location/$name")!!.toURI())
            val code = Files.readAllLines(path)
            val sourceCode = javaSource(name, location, code)
            return DetailedSourceProviderStub(sourceCode)
        }
    }
}

fun javaSource(name: String, location: String, code: List<String>): SourceCode {
    return SourceCode(SourceDescriptor(name, location, OopLanguage.JAVA), code)
}

fun defaultJavaSource(code: List<String>): SourceCode {
    return SourceCode(SourceDescriptor("Foo.java", "none", OopLanguage.JAVA), code)
}