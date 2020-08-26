package de.maibornwolff.codecharta.importer.sourcecodeparser.metrics

class ProjectMetrics {
    val projectMetrics = mutableMapOf<String, FileMetricMap>()

    fun addFile(file: String): ProjectMetrics {
        projectMetrics[file] = FileMetricMap()
        return this
    }

    fun addMetricToFile(file: String, metric: String, value: Number) {
        projectMetrics[file]?.add(metric, value)
    }

    fun addFileMetricMap(file: String, fileMetricMap: FileMetricMap) {
        projectMetrics[file] = fileMetricMap
    }

    fun getFileMetricMap(file: String): FileMetricMap? {
        return projectMetrics[file]
    }

    fun merge(newProjectMetrics: ProjectMetrics): ProjectMetrics {
        projectMetrics.putAll(newProjectMetrics.projectMetrics)
        return this
    }

    fun getRandomFileName(): String? {
        if (this.projectMetrics.isEmpty()) return null
        return this.projectMetrics.keys.iterator().next()
    }
}
