package de.maibornwolff.codecharta.parser.rawtextparser

import java.util.concurrent.ConcurrentHashMap

class ProjectMetrics(
        val metricsMap: ConcurrentHashMap<String, FileMetrics> = ConcurrentHashMap<String, FileMetrics>()
                    ) {

    fun addFileMetrics(filePath: String, fileMetrics: FileMetrics) {
        metricsMap[filePath] = fileMetrics
    }
}
