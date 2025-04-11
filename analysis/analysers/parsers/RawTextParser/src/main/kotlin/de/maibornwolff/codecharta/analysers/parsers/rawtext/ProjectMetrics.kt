package de.maibornwolff.codecharta.analysers.parsers.rawtext

import java.util.concurrent.ConcurrentHashMap

class ProjectMetrics {
    val metricsMap = ConcurrentHashMap<String, FileMetrics>()

    fun addFileMetrics(filePath: String, fileMetrics: FileMetrics): ProjectMetrics {
        metricsMap[filePath] = fileMetrics
        return this
    }

    fun isEmpty(): Boolean {
        return metricsMap.isEmpty()
    }

    fun hasMetric(metricName: String): Boolean {
        return metricsMap.containsKey(metricName)
    }
}
