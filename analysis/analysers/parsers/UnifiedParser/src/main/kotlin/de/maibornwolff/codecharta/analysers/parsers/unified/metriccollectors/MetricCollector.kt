package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.AvailableMetrics
import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.MetricNodeTypes
import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.NestedNodeType
import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.TreeNodeTypes
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeType
import org.treesitter.TSLanguage
import org.treesitter.TSNode
import org.treesitter.TSParser
import org.treesitter.TSTreeCursor
import java.io.File

abstract class MetricCollector(
    private val treeSitterLanguage: TSLanguage,
    private val queryProvider: MetricNodeTypes
) {
    private var lastCountedCommentLine = -1
    private var lastCountedCodeLine = -1
    private var rootNodeType: String = ""

    // maps a metric to its index for the more performant IntArray and the function how to calculate the metric
    private val metricInfo = mapOf(
        AvailableMetrics.COMPLEXITY to Pair(0) { node: TSNode, nodeType: String, _: Int, _: Int ->
            calculateComplexityForNode(node, nodeType)
        },
        AvailableMetrics.COMMENT_LINES to Pair(1) { node: TSNode, nodeType: String, startRow: Int, endRow: Int ->
            calculateCommentLinesForNode(node, nodeType, startRow, endRow)
        },
        AvailableMetrics.REAL_LINES_OF_CODE to Pair(2) { node: TSNode, nodeType: String, startRow: Int, endRow: Int ->
            calculateRealLinesOfCodeForNode(node, nodeType, startRow, endRow)
        }
    )

    fun collectMetricsForFile(file: File): MutableNode {
        val rootNode = getRootNode(file)
        rootNodeType = rootNode.type

        lastCountedCommentLine = -1
        lastCountedCodeLine = -1

        // we use an IntArray and not a map here as it improves performance
        val metricValues = IntArray(metricInfo.size) { 0 }
        walkTree(Pair(TSTreeCursor(rootNode), metricValues))

        val metricNameToValue = mapMetricValuesToNodeAttributes(metricValues)

        // lines of code is added here manually to improve performance as no tree walk is necessary
        metricNameToValue[AvailableMetrics.LINES_OF_CODE.metricName] = rootNode.endPoint.row

        return MutableNode(
            name = file.name,
            type = NodeType.File,
            attributes = metricNameToValue
        )
    }

    private fun getRootNode(file: File): TSNode {
        val parser = TSParser()
        parser.setLanguage(treeSitterLanguage)
        val rootNode = parser.parseString(null, file.readText()).rootNode
        return rootNode
    }

    private val walkTree = DeepRecursiveFunction<Pair<TSTreeCursor, IntArray>, Unit> { (cursor, metrics) ->
        val currentNode = cursor.currentNode()

        val nodeType = currentNode.type
        val startRow = currentNode.startPoint.row
        val endRow = currentNode.endPoint.row

        val skipRootToAvoidDoubleCountingLines = nodeType != rootNodeType
        if (skipRootToAvoidDoubleCountingLines) {
            for ((_, indexAndCalculateMetricForNodeFn) in metricInfo) {
                val (index, calculateMetricForNodeFn) = indexAndCalculateMetricForNodeFn
                metrics[index] += calculateMetricForNodeFn(currentNode, nodeType, startRow, endRow)
            }
        }

        if (cursor.gotoFirstChild()) {
            do {
                callRecursive(Pair(cursor, metrics))
            } while (cursor.gotoNextSibling())
            cursor.gotoParent()
        }
    }

    private fun mapMetricValuesToNodeAttributes(metricValues: IntArray): MutableMap<String, Int> {
        val metricNameToValue = mutableMapOf<String, Int>()

        for ((metric, indexAndCalculateMetricForNodeFn) in metricInfo) {
            val (index, _) = indexAndCalculateMetricForNodeFn
            metricNameToValue[metric.metricName] = metricValues[index]
        }

        return metricNameToValue
    }

    protected open fun calculateComplexityForNode(node: TSNode, nodeType: String): Int {
        return if (isNodeTypeAllowed(node, nodeType, queryProvider.complexityNodeTypes)) 1 else 0
    }

    protected open fun calculateCommentLinesForNode(node: TSNode, nodeType: String, startRow: Int, endRow: Int): Int {
        if (startRow > lastCountedCommentLine && isNodeTypeAllowed(node, nodeType, queryProvider.commentLineNodeTypes)) {
            lastCountedCommentLine = startRow
            return endRow - startRow + 1
        }
        return 0
    }

    protected open fun calculateRealLinesOfCodeForNode(node: TSNode, nodeType: String, startRow: Int, endRow: Int): Int {
        if (isNodeTypeAllowed(node, nodeType, queryProvider.commentLineNodeTypes)) return 0

        var rlocForNode = 0

        if (startRow > lastCountedCodeLine) {
            lastCountedCodeLine = startRow
            rlocForNode++
        }

        if (endRow > lastCountedCodeLine && countWholeNodeLength(node)) {
            lastCountedCodeLine = endRow
            rlocForNode += endRow - startRow
        }

        return rlocForNode
    }

    private fun isNodeTypeAllowed(node: TSNode, nodeType: String, allowedTypes: TreeNodeTypes): Boolean {
        if (allowedTypes.simpleNodeTypes.contains(nodeType)) {
            return true
        } else if (allowedTypes.nestedNodeTypes != null) {
            return isNestedTypeAllowed(node, nodeType, allowedTypes.nestedNodeTypes)
        }
        return false
    }

    private fun isNestedTypeAllowed(node: TSNode, nodeType: String, nestedTypes: Set<NestedNodeType>): Boolean {
        for (nestedType in nestedTypes) {
            if (nestedType.baseNodeType != nodeType) continue

            if (nestedType.childNodePosition != null && nestedType.childNodeCount == node.childCount) {
                val childNode = node.getChild(nestedType.childNodePosition)
                if (nestedType.childNodeTypes.contains(childNode.type)) return true
            } else if (nestedType.childNodeFieldName != null) {
                val childNode = node.getChildByFieldName(nestedType.childNodeFieldName)
                if (nestedType.childNodeTypes.contains(childNode.type)) return true
            }
        }
        return false
    }

    protected open fun countWholeNodeLength(node: TSNode): Boolean {
        return node.childCount == 0
    }
}
