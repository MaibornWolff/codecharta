package de.maibornwolff.codecharta.importer.sourcecodeparser.sonaranalyzers

import de.maibornwolff.codecharta.importer.sourcecodeparser.metrics.FileMetricMap
import org.sonar.api.batch.sensor.internal.SensorContextTester
import org.sonar.api.batch.sensor.measure.Measure
import org.sonar.api.measures.CoreMetrics
import java.io.File
import java.io.IOException
import java.io.Serializable
import java.nio.charset.Charset
import java.nio.file.Files

abstract class SonarAnalyzer(path: String) {

    protected lateinit var sensorContext: SensorContextTester
    var baseDir: File = File(path).absoluteFile

    abstract val FILE_EXTENSION: String

    open fun scanFiles(fileList: List<String>): Map<String, FileMetricMap> {

        createContext()
        for(file in fileList){
            addFileToContext(file)
        }
        buildSonarComponents()
        executeScan()

        val metricsMap: MutableMap<String, FileMetricMap> = HashMap()
        for(file in fileList){
            metricsMap[file] = retrieveMetrics(file)
        }
        return metricsMap
    }

    protected open fun retrieveMetrics(fileName: String): FileMetricMap {
        val key = "moduleKey:$fileName"
        val fileMetrics = FileMetricMap()

        val metrics = CoreMetrics.getMetrics()
        for(metric in metrics){
            val metricKey: String = metric.key
            val measure: Measure<Serializable> = sensorContext.measure(key, metricKey) ?: continue
            val metricValue = measure.value()
            if (metricValue is Number) {
                fileMetrics.add(metricKey, metricValue)
            }
        }
        return fileMetrics
    }

    protected open fun fileContent(file: File, charset: Charset) : String{
        try {
            return String(Files.readAllBytes(file.toPath()), charset)
        } catch (e: IOException) {
            throw IllegalStateException("Cannot read $file", e)
        }
    }

    protected abstract fun createContext()
    protected abstract fun buildSonarComponents()
    protected abstract fun addFileToContext(fileName: String)
    protected abstract fun executeScan()

}