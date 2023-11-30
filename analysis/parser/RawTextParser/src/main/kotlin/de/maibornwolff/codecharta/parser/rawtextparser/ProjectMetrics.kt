package de.maibornwolff.codecharta.parser.rawtextparser

import java.util.concurrent.ConcurrentHashMap

class ProjectMetrics {

    val metricsMap = ConcurrentHashMap<String, FileMetrics>()
    fun addFileMetrics(filePath: String, fileMetrics: FileMetrics): ProjectMetrics {
        metricsMap[filePath] = fileMetrics
        return this
    }
}
