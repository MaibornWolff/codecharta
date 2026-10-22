package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.csharp

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.CopyRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.DeclaringCopy
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FilePath

/** A partial class is one class over several files, which no single nearest file stands for: the first declaring file. */
internal object CSharpCopyRules : CopyRules {
    override fun filesFor(copies: List<DeclaringCopy>, usingFile: FilePath): List<FilePath> = listOf(copies.first().file)
}
