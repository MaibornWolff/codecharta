package de.maibornwolff.codecharta.model

import kotlin.math.max

class StatisticsType {
    private var totalRealLinesOfCode = 0
    private var totalLinesOfCode = 0

    private var programmingLanguages: MutableSet<String> = mutableSetOf()

    private var totalNumberOfFiles = 0
    private var numberOfFilesPerLanguage: MutableMap<String, Int> = mutableMapOf()

    private var maxFilePathDepth = 0
    private var totalFilePathDepth = 0
    private var avgFilePathDepth = 0.0


    private val metricStatisticsPerLanguage: MutableMap<String, MutableMap<String, MetricStatisticsType>> = mutableMapOf()
    private val metricStatisticsOverall: MutableMap<String, MetricStatisticsType> = mutableMapOf()

    fun refreshStatistics(node: MutableNode, position: Path) {
        if (node.type !== NodeType.File) {
            return
        }

        totalNumberOfFiles++

        totalFilePathDepth += position.edgesList.size
        maxFilePathDepth = max(maxFilePathDepth, position.edgesList.size)
        avgFilePathDepth = (totalFilePathDepth / totalNumberOfFiles).toDouble()

        val rloc = node.attributes["rloc"]
        if (rloc !== null) {
            totalRealLinesOfCode += rloc.toString().toInt()
        }

        val loc = node.attributes["loc"]
        if (loc !== null) {
            totalLinesOfCode += loc.toString().toInt()
        }

        val nodeFileType = node.getFileType()
        if (nodeFileType !== null) {
            programmingLanguages.add(nodeFileType)

            if (!numberOfFilesPerLanguage.containsKey(nodeFileType)) {
                numberOfFilesPerLanguage[nodeFileType] = 0
            }
            numberOfFilesPerLanguage[nodeFileType] = numberOfFilesPerLanguage[nodeFileType]!! + 1

            node.attributes.forEach { (metricName, metricValue) ->
                if (!metricStatisticsPerLanguage.containsKey(nodeFileType)) {
                    metricStatisticsPerLanguage[nodeFileType] = mutableMapOf()
                }
                if (!metricStatisticsPerLanguage[nodeFileType]!!.containsKey(metricName)) {
                    metricStatisticsPerLanguage[nodeFileType]!![metricName] = MetricStatisticsType(metricName, metricValue as Int)
                } else {
                    metricStatisticsPerLanguage[nodeFileType]!![metricName]!!.refresh(metricValue as Int)
                }
            }
        }

        node.attributes.forEach { (metricName, metricValue) ->
            if (!metricStatisticsOverall.containsKey(metricName)) {
                metricStatisticsOverall[metricName] = MetricStatisticsType(metricName, metricValue as Int)
            } else {
                metricStatisticsOverall[metricName]!!.refresh(metricValue as Int)
            }
        }
    }
}
