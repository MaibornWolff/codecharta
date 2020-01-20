package de.maibornwolff.codecharta.importer.understand

import com.univocity.parsers.csv.CsvParser
import com.univocity.parsers.csv.CsvParserSettings
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.model.ProjectBuilder
import de.maibornwolff.codecharta.translator.MetricNameTranslator
import mu.KotlinLogging
import java.io.InputStream
import java.io.InputStreamReader
import java.nio.charset.StandardCharsets
import java.util.*

class UnderstandProjectBuilder(
        private val pathSeparator: Char
) {

    private val logger = KotlinLogging.logger {}
    private val filterRule: (MutableNode) -> Boolean = { it.type == NodeType.File || it.type == NodeType.Folder }

    private val projectBuilder = ProjectBuilder()
            .withMetricTranslator(understandReplacement)
            .withFilter(filterRule)

    private var rowNumber = 1

    private val csvDelimiter = ','

    private val aggregationRules: Map<String, (Any, Any) -> Any>
        get() {
            val aggregationMap = mutableMapOf<String, (Any, Any) -> Any>()

            listOf(
                    "CountDeclClass",
                    "CountDeclClassMethod",
                    "CountDeclClassVariable",
                    "CountDeclExecutableUnit",
                    "CountDeclFile",
                    "CountDeclFunction",
                    "CountDeclInstanceMethod",
                    "CountDeclInstanceVariable",
                    "CountDeclInstanceVariableInternal",
                    "CountDeclInstanceVariableProtectedInternal",
                    "CountDeclMethod",
                    "CountDeclMethodAll",
                    "CountDeclMethodConst",
                    "CountDeclMethodDefault",
                    "CountDeclMethodFriend",
                    "CountDeclMethodInternal",
                    "CountDeclMethodPrivate",
                    "CountDeclMethodProtected",
                    "CountDeclMethodProtectedInternal",
                    "CountDeclMethodPublic",
                    "CountDeclMethodStrictPrivate",
                    "CountDeclMethodStrictPublished",
                    "CountDeclModule",
                    "CountDeclProgUnit",
                    "CountDeclSubprogram",
                    "CountLine",
                    "CountLine_Html",
                    "CountLine_Javascript",
                    "CountLine_Php",
                    "CountLineBlank",
                    "CountLineBlank_Html",
                    "CountLineBlank_Javascript",
                    "CountLineBlank_Php",
                    "CountLineCode",
                    "CountLineCode_Javascript",
                    "CountLineCode_Php",
                    "CountLineCodeDecl",
                    "CountLineCodeExe",
                    "CountLineComment",
                    "CountLineComment_Html",
                    "CountLineComment_Javascript",
                    "CountLineComment_Php",
                    "CountLineInactive",
                    "CountLinePreprocessor",
                    "CountPath",
                    "CountPathLog",
                    "CountSemicolon",
                    "CountStmt",
                    "CountStmtDecl",
                    "CountStmtDecl_Javascript",
                    "CountStmtDecl_Php",
                    "CountStmtExe",
                    "CountStmtExe_Javascript",
                    "CountStmtExe_Php",
                    "Knots",
                    "SumCyclomatic",
                    "SumCyclomaticModified",
                    "SumCyclomaticStrict",
                    "SumEssential"
            ).forEach {
                aggregationMap[it] = getSumOrFirst()
            }

            listOf(
                    "CountClassBase",
                    "CountClassCoupled",
                    "CountClassDerived",
                    "CountInput",
                    "CountOutput",
                    "MaxCyclomatic",
                    "MaxCyclomaticModified",
                    "MaxCyclomaticStrict",
                    "MaxEssential",
                    "MaxEssentialKnots",
                    "MaxEssentialStrictModified",
                    "MaxInheritanceTree",
                    "MaxNesting",
                    "PercentLackOfCohesion"
            ).forEach {
                aggregationMap[it] = getMaxValOrFirst()
            }

            return aggregationMap.toMap()
        }

    private val understandReplacement: MetricNameTranslator
        get() {
            val prefix = "understand_"
            val replacementMap = mutableMapOf<String, String>()

            // map understand name to codecharta name
            replacementMap["AvgCyclomatic"] = "average_function_mcc"
            replacementMap["CountDeclClass"] = "classes"
            replacementMap["CountDeclFile"] = "files"
            replacementMap["CountDeclMethod"] = "functions"
            replacementMap["CountDeclMethodPublic"] = "public_api"
            replacementMap["CountLine"] = "loc"
            replacementMap["CountLineCode"] = "rloc"
            replacementMap["CountLineComment"] = "comment_lines"
            replacementMap["CountStmt"] = "statements"
            replacementMap["MaxCyclomatic"] = "max_function_mcc"
            replacementMap["MaxNesting"] = "max_block_depth"
            replacementMap["SumCyclomatic"] = "mcc"

            // rename modified metrics
            replacementMap["CountClassBase"] = "max_base_classes"
            replacementMap["CountClassCoupled"] = "max_cbo"
            replacementMap["CountClassDerived"] = "max_noc"
            replacementMap["CountInput"] = "max_fanin"
            replacementMap["CountOutput"] = "max_fanout"
            replacementMap["MaxInheritanceTree"] = "max_dit"
            replacementMap["PercentLackOfCohesion"] = "max_lcom"

            // ignore following understand metrics
            replacementMap["Cyclomatic"] = ""
            replacementMap["CyclomaticModified"] = ""
            replacementMap["CyclomaticStrict"] = ""
            replacementMap["Essential"] = ""
            replacementMap["EssentialStrictModified"] = ""

            return MetricNameTranslator(replacementMap.toMap(), prefix)
        }

    fun parseCSVStream(
            inStream: InputStream
    ): UnderstandProjectBuilder {
        val parser = createParser(inStream)
        val header = UnderstandCSVHeader(parser.parseNext())
        parseContent(parser, header)
        parser.stopParsing()
        logger.info { "Found $rowNumber rows in stream." }
        return this
    }

    private fun isAggregationType(type: NodeType?): Boolean {
        return type != NodeType.Folder && type != NodeType.Unknown
    }

    private fun MutableNode.addAggregatedAttributes(
            aggregationRules: Map<String, (Any, Any) -> Any> = emptyMap()): Map<String, Any> {
        if (!children.isEmpty()) {

            if (isAggregationType(type)) {
                attributes = attributes.mergeReduce(
                        children.map { it.addAggregatedAttributes(aggregationRules) }
                                .reduce { acc, map -> map.mergeReduce(acc, aggregationRules) }
                ) { x, _ -> x }
            } else {
                children.map { it.addAggregatedAttributes(aggregationRules) }
                        .reduce { acc, map -> map.mergeReduce(acc, aggregationRules) }
            }
        }

        return attributes.filterKeys { aggregationRules.keys.contains(it) }
    }

    fun build(): Project {
        val nodes: List<MutableNode> = projectBuilder.rootNode.children
        nodes.forEach { it.addAggregatedAttributes(aggregationRules) }

        return projectBuilder.build()
    }

    private fun parseContent(parser: CsvParser, header: UnderstandCSVHeader) {
        var row = parser.parseNext()
        while (row != null) {
            rowNumber++
            projectBuilder.insertRow(row, header)
            row = parser.parseNext()
        }
    }

    private fun createParser(inStream: InputStream): CsvParser {
        val parserSettings = CsvParserSettings()
        parserSettings.format.delimiter = csvDelimiter
        parserSettings.isLineSeparatorDetectionEnabled = true

        val parser = CsvParser(parserSettings)
        parser.beginParsing(InputStreamReader(inStream, StandardCharsets.UTF_8))
        return parser
    }

    private fun ProjectBuilder.insertRow(rawRow: Array<String?>, header: UnderstandCSVHeader) {
        try {
            val row = UnderstandCSVRow(rawRow, header, pathSeparator)
            this.insertByPath(row.pathInTree(), row.asNode())
        } catch (e: IllegalArgumentException) {
            logger.warn { "Ignoring $rowNumber-th row ${Arrays.toString(rawRow)} due to: ${e.message}" }
        }
    }
}