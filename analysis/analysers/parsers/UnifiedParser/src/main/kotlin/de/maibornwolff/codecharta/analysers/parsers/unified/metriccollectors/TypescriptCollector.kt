package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import org.treesitter.TSNode
import org.treesitter.TSQuery
import org.treesitter.TSQueryCursor
import org.treesitter.TreeSitterTypescript

class TypescriptCollector {
    companion object {
        fun getMetricFromQuery(node: TSNode, query: String): Int {
            val tsQuery = TSQuery(TreeSitterTypescript(), query)
            val cursor = TSQueryCursor()
            cursor.exec(tsQuery, node)
            var metricHits = 0
            for (hit in cursor.matches) metricHits++
            return metricHits
        }
    }
}
