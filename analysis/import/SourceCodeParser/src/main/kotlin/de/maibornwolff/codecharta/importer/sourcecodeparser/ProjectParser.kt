package de.maibornwolff.codecharta.importer.sourcecodeparser

import de.maibornwolff.codecharta.importer.sourcecodeparser.metrics.ProjectMetrics
import de.maibornwolff.codecharta.importer.sourcecodeparser.sonaranalyzers.JavaSonarAnalyzer
import de.maibornwolff.codecharta.importer.sourcecodeparser.sonaranalyzers.SonarAnalyzer
import java.io.File

class ProjectParser {
    var metricKinds: MutableSet<String> = HashSet()
    var projectMetrics = ProjectMetrics()
    var sonarAnalyzers: MutableList<SonarAnalyzer> = mutableListOf()

    fun setUpAnalyzers() {
        sonarAnalyzers.add(JavaSonarAnalyzer())
    }

    fun scanProject(root: File) {
        val projectTraverser = ProjectTraverser(root)
        projectTraverser.traverse()

        for(analyzer in sonarAnalyzers){
            val files = projectTraverser.getFileListByExtension(analyzer.FILE_EXTENSION)
            val metricsForKind = analyzer.scanFiles(files, projectTraverser.root)
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