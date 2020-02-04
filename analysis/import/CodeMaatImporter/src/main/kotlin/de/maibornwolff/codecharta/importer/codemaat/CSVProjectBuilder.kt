package de.maibornwolff.codecharta.importer.codemaat

import com.univocity.parsers.csv.CsvParser
import com.univocity.parsers.csv.CsvParserSettings
import de.maibornwolff.codecharta.model.AttributeTypes
import de.maibornwolff.codecharta.model.Edge
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.model.ProjectBuilder
import de.maibornwolff.codecharta.translator.MetricNameTranslator
import mu.KotlinLogging
import java.io.InputStream
import java.io.InputStreamReader
import java.nio.charset.StandardCharsets

class CSVProjectBuilder(
        private val pathSeparator: Char,
        private val csvDelimiter: Char,
        metricNameTranslator: MetricNameTranslator = MetricNameTranslator.TRIVIAL,
        attributeTypes: AttributeTypes = AttributeTypes(mutableMapOf())
) {

    private val logger = KotlinLogging.logger {}

    private val includeRows: (Array<String>) -> Boolean = { true }
    private val projectBuilder = ProjectBuilder()
            .withMetricTranslator(metricNameTranslator)
            .addAttributeTypes(attributeTypes)

    fun parseCSVStream(inStream: InputStream): ProjectBuilder {
        val parser = createParser(inStream)
        val header = CSVHeader(parser.parseNext())
        parseContent(parser, header)
        parser.stopParsing()
        return projectBuilder
    }

    fun build(): Project {
        return projectBuilder.build()
    }

    private fun parseContent(parser: CsvParser, header: CSVHeader) {
        var row = parser.parseNext()
        while (row != null) {
            if (includeRows(row)) {
                try {
                    val csvRow = CSVRow(row, header, pathSeparator)
                    val edge: Edge = csvRow.asEdge()
                    projectBuilder.insertEdge(edge)
                } catch (e: IllegalArgumentException) {
                    logger.warn { "Ignoring row due to ${e.message}" }
                }
            }
            row = parser.parseNext()
        }
    }

    private fun createParser(inStream: InputStream): CsvParser {
        val parserSettings = CsvParserSettings()
        parserSettings.format.delimiter = csvDelimiter
        parserSettings.format.lineSeparator = "\n".toCharArray()

        val parser = CsvParser(parserSettings)
        parser.beginParsing(InputStreamReader(inStream, StandardCharsets.UTF_8))
        return parser
    }
}
