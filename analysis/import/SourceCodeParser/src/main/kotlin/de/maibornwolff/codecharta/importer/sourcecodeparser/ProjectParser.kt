package de.maibornwolff.codecharta.importer.sourcecodeparser

import de.maibornwolff.codecharta.importer.sourcecodeparser.metrics.ProjectMetrics
import de.maibornwolff.codecharta.importer.sourcecodeparser.sonaranalyzers.JavaSonarAnalyzer
import de.maibornwolff.codecharta.importer.sourcecodeparser.sonaranalyzers.SonarAnalyzer
import java.io.File

class ProjectParser(
    private val exclude: Array<String> = arrayOf(),
    private val verbose: Boolean = false,
    private val findIssues: Boolean = true
) {
    var metricKinds: MutableSet<String> = HashSet()
    var projectMetrics = ProjectMetrics()
    var sonarAnalyzers: MutableList<SonarAnalyzer> = mutableListOf()
    fun setUpAnalyzers() {
        sonarAnalyzers.add(JavaSonarAnalyzer(verbose, findIssues))
    }

    fun scanProject(root: File) {
        val projectTraverser = ProjectTraverser(root, exclude)
        projectTraverser.traverse()

        for (analyzer in sonarAnalyzers) {
            val files = projectTraverser.getFileListByExtension(analyzer.FILE_EXTENSION)
            val metricsForKind: ProjectMetrics = analyzer.scanFiles(files, projectTraverser.root)
            projectMetrics.merge(metricsForKind)
            updateMetricKinds(metricsForKind)
        }
    }

    private fun updateMetricKinds(metricsMap: ProjectMetrics) {
        val sampleFile = metricsMap.getRandomFileName() ?: return
        val fileMetrics = metricsMap.getFileMetricMap(sampleFile)!!.fileMetrics
        metricKinds.addAll(fileMetrics.keys)
    }
}