package de.maibornwolff.codecharta.analysers.parsers.unified

import de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors.AvailableCollectors
import de.maibornwolff.codecharta.model.MutableNode
import java.io.File

/** Measures the content of one file of a supported language into its node. */
fun interface FileMeasurer {
    fun measure(file: File, content: String): MutableNode
}

/** Measures a file with the collector of its language. */
val collectorMeasurer = FileMeasurer { file, content ->
    val collector = requireNotNull(AvailableCollectors.forExtension(file.extension)) {
        "Unexpectedly encountered an unsupported file at ${file.path}!"
    }
    collector.collectorFactory().collectMetricsForFile(file, content)
}
