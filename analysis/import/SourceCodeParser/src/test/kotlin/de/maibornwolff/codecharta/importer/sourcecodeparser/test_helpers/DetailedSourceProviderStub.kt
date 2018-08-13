package de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.source.SourceCode
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.source.SourceDescriptor
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics.OopLanguage
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application.DetailedSourceProvider
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application.OverviewSourceProvider
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.infrastructure.FileSystemDetailedSourceProvider
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.infrastructure.FileSystemOverviewSourceProvider
import java.nio.file.Paths


fun javaSource(name: String, location: String, code: List<String>): SourceCode {
    return SourceCode(SourceDescriptor(name, location, OopLanguage.JAVA), code)
}

fun defaultJavaSource(code: List<String>): SourceCode {
    val stacktrace = Thread.currentThread().stackTrace
    val e = stacktrace[2]
    return SourceCode(SourceDescriptor("${e.className}.${e.methodName}", "none", OopLanguage.JAVA), code)
}

class DetailedSourceProviderStub(private val sourceCode: SourceCode) : DetailedSourceProvider {
    override fun readSource(): SourceCode = sourceCode
}

fun detailedSourceProviderFromResource(location: String): FileSystemDetailedSourceProvider {
    val path = Paths.get(DetailedSourceProviderStub::class.java.classLoader.getResource(location)!!.toURI())
    return FileSystemDetailedSourceProvider(path.toFile())
}

fun overviewSourceProviderFromResource(location: String): OverviewSourceProvider {
    val path = Paths.get(DetailedSourceProviderStub::class.java.classLoader.getResource(location)!!.toURI())
    return FileSystemOverviewSourceProvider(listOf(path.toFile()))
}