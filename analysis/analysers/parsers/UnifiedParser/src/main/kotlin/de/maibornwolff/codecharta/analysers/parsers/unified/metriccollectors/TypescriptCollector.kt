package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.analysers.parsers.unified.metricqueries.typescript.TypescriptQueries
import org.treesitter.TSNode
import org.treesitter.TSParser
import org.treesitter.TSQuery
import org.treesitter.TSQueryCursor
import org.treesitter.TreeSitterTypescript

class TypescriptCollector : MetricCollector<TSNode>(TypescriptQueries()) {

    override fun createTreeNodes(code: String): TSNode {
        val parser = TSParser()
        parser.language = TreeSitterTypescript()
        val tree = parser.parseString(null, code)
        return tree.rootNode
    }

    //TODO: maybe function should be in metricCollector with wildcard type for node
    override fun getMetricFromQuery(node: TSNode, query: String): Int {
            val tsQuery = TSQuery(TreeSitterTypescript(), query)
            val cursor = TSQueryCursor()
            cursor.exec(tsQuery, node)
            var metricHits = 0
            for (hit in cursor.matches) metricHits++
            return metricHits
    }
}
