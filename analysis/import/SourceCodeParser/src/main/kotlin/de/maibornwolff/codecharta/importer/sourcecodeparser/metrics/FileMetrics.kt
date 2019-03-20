package de.maibornwolff.codecharta.importer.sourcecodeparser.metrics

import java.io.Serializable

class FileMetrics {

    private var metricsMap: MutableMap<String, Serializable> = HashMap()

    fun add(key: String, value: Serializable): FileMetrics{
        metricsMap[key] = value
        return this
    }

    fun get(key: String) : Serializable?{
        return metricsMap[key]
    }

    fun getMap() : MutableMap<String, Serializable>{
        return metricsMap
    }


}