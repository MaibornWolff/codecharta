package de.maibornwolff.codecharta.importer.sourcecodeparser.sonaranalyzers

import de.maibornwolff.codecharta.importer.sourcecodeparser.metrics.FileMetrics
import org.sonar.api.batch.sensor.internal.SensorContextTester
import org.sonar.api.measures.CoreMetrics
import org.sonar.api.measures.Metric
import org.sonar.api.batch.sensor.measure.Measure
import java.io.File
import java.io.IOException
import java.io.Serializable
import java.lang.IllegalStateException
import java.nio.charset.Charset
import java.nio.file.Files

open abstract class SonarAnalyzer(path: String) {

    protected lateinit var sensorContext: SensorContextTester
    var baseDir: File = File(path).absoluteFile

    open fun scanFiles(fileList: List<String>) : Map<String, FileMetrics>{

        createContext()
        for(file in fileList){
            addFileToContext(file)
        }
        executeScan()

        var metricsMap: MutableMap<String, FileMetrics> = HashMap()
        for(file in fileList){
            metricsMap[file] = retrieveMetrics(file)
        }
        return metricsMap
    }

    protected open fun retrieveMetrics(fileName: String): FileMetrics{
        val key = "moduleKey:$fileName"
        var fileMetrics = FileMetrics()

        val metrics = CoreMetrics.getMetrics()
        for(metric in metrics){
            val metricKey: String = metric.key
            val measure: Measure<Serializable> = sensorContext.measure(key, metricKey) ?: continue
            val metricValue = measure.value()
            fileMetrics.add(metricKey, metricValue)
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
    protected abstract fun addFileToContext(file: String)
    protected abstract fun executeScan()

}