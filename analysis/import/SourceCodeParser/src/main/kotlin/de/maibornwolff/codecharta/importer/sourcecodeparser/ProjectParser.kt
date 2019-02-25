package de.maibornwolff.codecharta.importer.sourcecodeparser

import de.maibornwolff.codecharta.importer.sourcecodeparser.metrics.FileMetrics
import de.maibornwolff.codecharta.importer.sourcecodeparser.sonaranalyzers.JavaSonarAnalyzer
import de.maibornwolff.codecharta.importer.sourcecodeparser.sonaranalyzers.SonarAnalyzer
import java.io.File
import java.io.Writer

class ProjectParser {
    private var metricTypes: MutableSet<String> = HashSet()
    private var projectMetrics: MutableMap<String, FileMetrics> = HashMap()
    private var sonarAnalyzers: MutableList<SonarAnalyzer> = mutableListOf()

    private fun setUpAnalyzers(root: File) {
        val baseDir = root.toString()
        sonarAnalyzers.add(JavaSonarAnalyzer(baseDir))
    }

    fun scanProject(root: File, writer: Writer?) {
        setUpAnalyzers(root)
        val projectTraverser = ProjectTraverser(root)
        projectTraverser.traverse()

        for(analyzer in sonarAnalyzers){
            var files = projectTraverser.getFileListByExtension(analyzer.FILE_EXTENSION)
            println(analyzer.scanFiles(files))
            projectMetrics.putAll(analyzer.scanFiles(files))
        }
    }
}