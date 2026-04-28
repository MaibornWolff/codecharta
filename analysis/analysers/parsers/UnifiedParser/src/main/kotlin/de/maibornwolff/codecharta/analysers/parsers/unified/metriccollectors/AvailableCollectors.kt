package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.serialization.FileExtension
import de.maibornwolff.treesitter.excavationsite.api.Language

/** Maps each supported [FileExtension] to a factory for the corresponding [TreeSitterLibraryCollector]. */
enum class AvailableCollectors(
    /** The file extension this collector handles. */
    val fileExtension: FileExtension,
    /** Factory function that creates the collector for this language. */
    val collectorFactory: () -> TreeSitterLibraryCollector
) {
    TYPESCRIPT(FileExtension.TYPESCRIPT, { TreeSitterLibraryCollector(Language.TYPESCRIPT) }),
    TSX(FileExtension.TSX, { TreeSitterLibraryCollector(Language.TSX) }),
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
    VUE(FileExtension.VUE, { TreeSitterLibraryCollector(Language.VUE) }),
    DELPHI(FileExtension.DELPHI, { TreeSitterLibraryCollector(Language.DELPHI) })
}
