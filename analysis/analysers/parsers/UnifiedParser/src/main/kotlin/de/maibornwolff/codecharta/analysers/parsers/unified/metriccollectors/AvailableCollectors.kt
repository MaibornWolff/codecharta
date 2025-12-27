package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.serialization.FileExtension
import de.maibornwolff.treesitter.excavationsite.api.Language

enum class AvailableCollectors(
    val fileExtension: FileExtension,
    val collectorFactory: () -> TreeSitterLibraryCollector
) {
    TYPESCRIPT(FileExtension.TYPESCRIPT, { TreeSitterLibraryCollector(Language.TYPESCRIPT) }),
    JAVASCRIPT(FileExtension.JAVASCRIPT, { TreeSitterLibraryCollector(Language.JAVASCRIPT) }),
    KOTLIN(FileExtension.KOTLIN, { TreeSitterLibraryCollector(Language.KOTLIN) }),
    OBJECTIVE_C(FileExtension.OBJECTIVE_C, { TreeSitterLibraryCollector(Language.OBJECTIVE_C) }),
    JAVA(FileExtension.JAVA, { TreeSitterLibraryCollector(Language.JAVA) }),
    CSHARP(FileExtension.CSHARP, { TreeSitterLibraryCollector(Language.CSHARP) }),
    CPP(FileExtension.CPP, { TreeSitterLibraryCollector(Language.CPP) }),
    C(FileExtension.C, { TreeSitterLibraryCollector(Language.C) }),
    PYTHON(FileExtension.PYTHON, { TreeSitterLibraryCollector(Language.PYTHON) }),
    GO(FileExtension.GO, { TreeSitterLibraryCollector(Language.GO) }),
    PHP(FileExtension.PHP, { TreeSitterLibraryCollector(Language.PHP) }),
    RUBY(FileExtension.RUBY, { TreeSitterLibraryCollector(Language.RUBY) }),
    SWIFT(FileExtension.SWIFT, { TreeSitterLibraryCollector(Language.SWIFT) }),
    BASH(FileExtension.BASH, { TreeSitterLibraryCollector(Language.BASH) }),
    VUE(FileExtension.VUE, { TreeSitterLibraryCollector(Language.VUE) })
}
