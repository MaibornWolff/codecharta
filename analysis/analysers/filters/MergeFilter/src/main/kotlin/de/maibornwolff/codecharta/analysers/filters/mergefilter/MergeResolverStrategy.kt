package de.maibornwolff.codecharta.analysers.filters.mergefilter

import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeId
import de.maibornwolff.codecharta.model.Path
import de.maibornwolff.codecharta.util.Logger

/**
 * The merge resolver that replaces the former recursive and leaf strategies. The mode is a
 * compile-time choice — [MergeFilter] picks one resolver and never switches — so each mode is its own
 * subclass rather than a branch this class takes on every node:
 *
 * - [UnionMergeResolver] (formerly *recursive*): merges nodes whose tree positions (ids) coincide and
 *   keeps every other node — the same-rooting union, used as the default and for piped merges.
 * - [OverlayMergeResolver] (formerly *leaf*): overlays each incoming leaf onto the reference tree by a
 *   prioritized chain — exact id (tree position) → unique content hash (rename) → longest path-suffix
 *   (differently-rooted trees) → keep + warn. Ambiguous content or suffix matches are skipped, never
 *   guessed; unmatched leaves are kept only when the `-a` flag is set, otherwise they are dropped with
 *   a warning.
 *
 * This class holds what both share: the fold used to compare names, the fold-and-merge skeleton, and
 * the processed/merged counters that skeleton keeps. Construct one through [recursive] or [leaf].
 */
sealed class MergeResolverStrategy(protected val ignoreCase: Boolean) : NodeMergerStrategy {
    protected var nodesProcessed = 0
    protected var nodesMerged = 0

    final override fun mergeNodeLists(nodeLists: List<List<MutableNode>>): List<MutableNode> {
        if (nodeLists.isEmpty()) return listOf()
        return nodeLists.reduce { mergedNodeList, nextNodeList ->
            nextNodeList.fold(mergedNodeList) { accumulatedNodes, nextNode ->
                nodesProcessed++
                mergeNode(accumulatedNodes, nextNode)
            }
        }
    }

    /** Folds one incoming node into the nodes accumulated so far. The one step the two modes disagree on. */
    protected abstract fun mergeNode(nodeList: List<MutableNode>, node: MutableNode): List<MutableNode>

    protected abstract fun statsMessage(): String

    final override fun logMergeStats() {
        Logger.info { statsMessage() }
        if (nodesMerged == 0) {
            Logger.warn { "No nodes were merged. Hierarchies may not match up." }
        }
    }

    // NFC-normalize before comparing so a name spelled NFD (macOS walkers) and NFC (git parsers) is
    // treated as one node. Node identity ([NodeId]) is NFC, so without this the variants survive the
    // merge as distinct siblings and then collide on one id at the 2.0 writer's duplicate-id guard.
    //
    // When ignoreCase, fold each character the way String.equals(ignoreCase = true) does — uppercase
    // then lowercase — rather than through String.lowercase(), which is locale-aware and can change a
    // string's length ("İ" lowercases to two characters), so it disagrees with equals() on exactly the
    // names where it matters. Folding to a canonical form instead of comparing pairwise is what lets
    // OVERLAY index its reference leaves by name rather than rescan them.
    protected fun foldedName(name: String): String {
        val normalized = NodeId.normalizeName(name)
        return if (ignoreCase) normalized.map { it.uppercaseChar().lowercaseChar() }.joinToString("") else normalized
    }

    protected fun foldedEdges(path: Path): List<String> = path.edgesList.map { foldedName(it) }

    protected fun namesMatch(first: String, second: String): Boolean = foldedName(first) == foldedName(second)

    companion object {
        fun recursive(ignoreCase: Boolean = false): MergeResolverStrategy = UnionMergeResolver(ignoreCase)

        fun leaf(addUnmatchedNodes: Boolean, ignoreCase: Boolean = false): MergeResolverStrategy =
            OverlayMergeResolver(addUnmatchedNodes, ignoreCase)
    }
}
