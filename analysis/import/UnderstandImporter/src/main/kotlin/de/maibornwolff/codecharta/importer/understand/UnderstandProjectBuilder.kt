/*
 * Copyright (c) 2018, MaibornWolff GmbH
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *  * Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *  * Neither the name of  nor the names of its contributors may be used to
 *    endorse or promote products derived from this software without specific
 *    prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

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
        projectName: String,
        private val pathSeparator: Char,
        aggregation: AGGREGATION = AGGREGATION.FILE
) {
    private val logger = KotlinLogging.logger {}

    private val filterRule: (MutableNode) -> Boolean = { it.type == NodeType.File || it.type == NodeType.Folder }

    private val projectBuilder = ProjectBuilder(projectName)
            .withMetricTranslator(understandReplacement)
            .withAggregationRules(aggregationRules)
            .withFilter(filterRule)

    init {
        if (aggregation != AGGREGATION.FILE) throw NotImplementedError("Only file aggregation is implemented yet.")
    }

    private var rowNumber = 1

    private val csvDelimiter = ','

    private val sumAttributes: (Any, Any) -> Any = { x, y ->
        when {
            x is Long && y is Long -> x + y
            x is Number && y is Number -> x.toDouble() + y.toDouble()
            else -> x
        }
    }

    private val maxAttribute: (Any, Any) -> Any = { x, y ->
        when {
            x is Long && y is Long -> maxOf(x, y)
            x is Number && y is Number -> maxOf(x.toDouble(), y.toDouble())
            else -> x
        }
    }

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
                    "CountDeclMethod",
                    "CountDeclMethodAll",
                    "CountDeclMethodDefault",
                    "CountDeclMethodPrivate",
                    "CountDeclMethodProtected",
                    "CountDeclMethodPublic",
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
                    "Cyclomatic",
                    "CyclomaticModified",
                    "CyclomaticStrict",
                    "Essential",
                    "Knots",
                    "SumCyclomatic",
                    "SumCyclomaticModified",
                    "SumCyclomaticStrict",
                    "SumEssential"
            ).forEach {
                aggregationMap[it] = sumAttributes
            }

            listOf(
                    "CountClassBase",
                    "CountClassCoupled",
                    "CountClassDerived",
                    "CountInput",
                    "CountOutput"
            ).forEach {
                aggregationMap[it] = maxAttribute
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
            replacementMap["CountDeclMethod"] = "functions"
            replacementMap["CountDeclMethodPublic"] = "public_api"
            replacementMap["CountLine"] = "loc"
            replacementMap["CountLineCode"] = "rloc"
            replacementMap["CountLineComment"] = "comment_lines"
            replacementMap["CountStmt"] = "statements"
            replacementMap["MaxCyclomatic"] = "max_function_mcc"
            replacementMap["MaxNesting"] = "max_block_depth"
            replacementMap["SumCyclomatic"] = "mcc"

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
        parseContent(projectBuilder, parser, header)
        parser.stopParsing()
        logger.info { "Found $rowNumber rows in stream." }
        return this
    }

    fun build(): Project {
        logger.info { "ProjectBuilder with ${projectBuilder.size} leafs and ${projectBuilder.rootNode.nodes.count { it.value.type == NodeType.File }} files." }

        return projectBuilder.build()
    }

    private fun parseContent(projectBuilder: ProjectBuilder, parser: CsvParser, header: UnderstandCSVHeader) {
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

enum class AGGREGATION {
    FILE
}