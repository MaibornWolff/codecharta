package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.serialization.FileExtension

enum class AvailableCollectors(
    val fileExtension: FileExtension,
    val collectorFactory: () -> MetricCollector
) {
    TYPESCRIPT(FileExtension.TYPESCRIPT, ::TypescriptCollector),
    JAVASCRIPT(FileExtension.JAVASCRIPT, ::JavascriptCollector),
    KOTLIN(FileExtension.KOTLIN, ::KotlinCollector),
    JAVA(FileExtension.JAVA, ::JavaCollector),
    CSHARP(FileExtension.CSHARP, ::CSharpCollector),
    CPP(FileExtension.CPP, ::CppCollector),
    C(FileExtension.C, ::CCollector),
    PYTHON(FileExtension.PYTHON, ::PythonCollector),
    GO(FileExtension.GO, ::GoCollector),
    PHP(FileExtension.PHP, ::PhpCollector),
    RUBY(FileExtension.RUBY, ::RubyCollector),
    BASH(FileExtension.BASH, ::BashCollector)
}
