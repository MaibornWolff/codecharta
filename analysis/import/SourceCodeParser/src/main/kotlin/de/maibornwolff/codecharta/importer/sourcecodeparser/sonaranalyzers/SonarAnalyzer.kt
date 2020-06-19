package de.maibornwolff.codecharta.importer.sourcecodeparser.sonaranalyzers

import de.maibornwolff.codecharta.importer.sourcecodeparser.metrics.FileMetricMap
import de.maibornwolff.codecharta.importer.sourcecodeparser.metrics.ProjectMetrics
import org.sonar.api.batch.sensor.internal.SensorContextTester
import org.sonar.api.batch.sensor.measure.Measure
import org.sonar.api.measures.CoreMetrics
import java.io.File
import java.io.IOException
import java.io.Serializable
import java.nio.charset.Charset
import java.nio.file.Files

abstract class SonarAnalyzer(protected val verbose: Boolean = false, protected val searchIssues: Boolean) {

    protected lateinit var sensorContext: SensorContextTester
    open lateinit var baseDir: File

    abstract val FILE_EXTENSION: String

    open fun scanFiles(fileList: List<String>, root: File): ProjectMetrics {
        baseDir = root.absoluteFile

        createContext()
        for (file in fileList) {
            addFileToContext(file)
        }
        buildSonarComponents()
        executeScan()

        val projectMetrics = ProjectMetrics()
        for (file in fileList) {
            projectMetrics.addFileMetricMap(file, retrieveMetrics(file))
        }
        return projectMetrics
    }

    protected open fun retrieveMetrics(fileName: String): FileMetricMap {
        val key = "moduleKey:$fileName"
        val fileMetrics = FileMetricMap()

        val metrics = CoreMetrics.getMetrics()
        for (metric in metrics) {
            var metricKey: String = metric.key
            val measure: Measure<Serializable> = sensorContext.measure(key, metricKey) ?: continue
            val metricValue = measure.value()
            if (metricValue is Number) {
                metricKey = translateMetricNames(metricKey)
                fileMetrics.add(metricKey, metricValue)
            }
        }
        return fileMetrics
    }

    protected open fun fileContent(file: File, charset: Charset): String {
        try {
            return String(Files.readAllBytes(file.toPath()), charset)
        } catch (e: IOException) {
            throw IllegalStateException("Cannot read $file", e)
        }
    }

    protected open fun translateMetricNames(metricKey: String): String {
        return when (metricKey) {
            "commented_out_code_lines" -> "commented_out_loc"
            "complexity" -> "mcc"
            "function_complexity" -> "average_function_mcc"
            "lines" -> "loc"
            "ncloc" -> "rloc"
            else -> metricKey
        }
    }

    protected abstract fun createContext()
    protected abstract fun buildSonarComponents()
    protected abstract fun addFileToContext(fileName: String)
    protected abstract fun executeScan()
}