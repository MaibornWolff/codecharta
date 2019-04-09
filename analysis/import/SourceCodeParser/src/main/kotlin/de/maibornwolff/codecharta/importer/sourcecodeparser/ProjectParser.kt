package de.maibornwolff.codecharta.importer.sourcecodeparser

import de.maibornwolff.codecharta.importer.sourcecodeparser.metrics.FileMetricMap
import de.maibornwolff.codecharta.importer.sourcecodeparser.sonaranalyzers.JavaSonarAnalyzer
import de.maibornwolff.codecharta.importer.sourcecodeparser.sonaranalyzers.SonarAnalyzer
import java.io.File

class ProjectParser {
    var metricKinds: MutableSet<String> = HashSet()
    var projectMetrics: MutableMap<String, FileMetricMap> = hashMapOf()
    protected var sonarAnalyzers: MutableList<SonarAnalyzer> = mutableListOf()

    private fun setUpAnalyzers(root: File) {
        val baseDir = root.toString()
        sonarAnalyzers.add(JavaSonarAnalyzer(baseDir))
    }

    fun scanProject(root: File) {
        setUpAnalyzers(root)
        val projectTraverser = ProjectTraverser(root)
        projectTraverser.traverse()

        for(analyzer in sonarAnalyzers){
            val files = projectTraverser.getFileListByExtension(analyzer.FILE_EXTENSION)
            val metricsForKind = analyzer.scanFiles(files)
            projectMetrics.putAll(metricsForKind)
            updateMetricKinds(metricsForKind)
        }
    }

    private fun updateMetricKinds(metricsMap: Map<String, FileMetricMap>) {
        if(metricsMap.isEmpty()) return

        val sampleFile = metricsMap.keys.iterator().next()
        val fileMetrics = metricsMap[sampleFile]!!.fileMetrics
        metricKinds.addAll(fileMetrics.keys)
    }

}