package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.golang.GoAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage

internal object GoAnalyzerTestSupport {
    fun analyzeGo(goCode: String, physicalPath: String = "./path"): List<Node> =
        GoAnalyzer(FileInfo(SupportedLanguage.GO, physicalPath, goCode)).analyze().nodes

    fun List<Node>.named(name: String): Node? = find { it.pathWithName.parts.last() == name }

    fun List<Node>.names(): List<String> = map { it.pathWithName.parts.last() }

    fun List<Node>.resolveAgainstEachOther(): List<Node> {
        val projectDictionary = map { it.pathWithName }.groupBy { it.parts.last() }
        val knownNodePaths = map { it.pathWithName.withDots() }.toSet()
        return map { it.resolveTypes(projectDictionary, emptyMap(), knownNodePaths) }
    }
}
