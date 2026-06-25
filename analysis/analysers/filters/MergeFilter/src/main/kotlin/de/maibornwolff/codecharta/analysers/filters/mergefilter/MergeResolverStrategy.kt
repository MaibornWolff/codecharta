package de.maibornwolff.codecharta.analysers.filters.mergefilter

import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.Path
import de.maibornwolff.codecharta.util.Logger

/**
 * The single merge resolver that replaces the former recursive and leaf strategies.
 *
 * - [Mode.UNION] (formerly *recursive*): merges nodes whose tree positions (ids) coincide and keeps
 *   every other node — the same-rooting union, used as the default and for piped merges.
 * - [Mode.OVERLAY] (formerly *leaf*): overlays each incoming leaf onto the reference tree by a
 *   prioritized chain — exact id (tree position) → unique content hash (rename) → longest
 *   path-suffix (differently-rooted trees) → keep + warn. Ambiguous content or suffix matches are
 *   skipped, never guessed; unmatched leaves are kept only when [addUnmatchedNodes] is set
 *   (the `-a` flag), otherwise they are dropped with a warning.
 */
class MergeResolverStrategy private constructor(
    private val mode: Mode,
    private val addUnmatchedNodes: Boolean,
    private val ignoreCase: Boolean
) : NodeMergerStrategy {
    enum class Mode { UNION, OVERLAY }

    override val mergesEdges: Boolean
        get() = mode == Mode.UNION

    private var nodesProcessed = 0
    private var nodesMerged = 0
    private var nodesUnmatched = 0

    override fun mergeNodeLists(nodeLists: List<List<MutableNode>>): List<MutableNode> {
        if (nodeLists.isEmpty()) return listOf()
        return nodeLists.reduce { mergedNodeList, nextNodeList ->
            nextNodeList.fold(mergedNodeList) { accumulatedNodes, nextNode ->
                nodesProcessed++
                when (mode) {
                    Mode.UNION -> mergeOrAppendNode(accumulatedNodes, nextNode)
                    Mode.OVERLAY -> overlayNodeOntoReference(accumulatedNodes, nextNode)
                }
            }
        }
    }

    override fun logMergeStats() {
        Logger.info {
            when (mode) {
                Mode.UNION -> "$nodesProcessed nodes were processed, ${nodesProcessed - nodesMerged} were added and $nodesMerged were merged"
                Mode.OVERLAY -> "$nodesProcessed nodes were processed and $nodesMerged were merged ($nodesUnmatched could not be matched)"
            }
        }
        if (nodesMerged == 0) {
            Logger.warn { "No nodes were merged. Hierarchies may not match up." }
        }
    }

    private fun namesMatch(first: String, second: String): Boolean = first.equals(second, ignoreCase = ignoreCase)

    // --- UNION (recursive) ----------------------------------------------------------------------

    private fun mergeOrAppendNode(nodeList: List<MutableNode>, node: MutableNode): List<MutableNode> {
        if (nodeList.none { namesMatch(it.name, node.name) }) {
            return nodeList + node
        }
        nodesMerged++
        return nodeList.map { if (namesMatch(it.name, node.name)) mergeRecursively(it, node) else it }
    }

    private fun mergeRecursively(reference: MutableNode, incoming: MutableNode): MutableNode {
        val merged = reference.merge(listOf(incoming))
        merged.children.addAll(mergeNodeLists(listOf(reference.children.toList(), incoming.children.toList())))
        return merged
    }

    // --- OVERLAY (leaf) -------------------------------------------------------------------------

    private fun overlayNodeOntoReference(nodeList: List<MutableNode>, node: MutableNode): List<MutableNode> = nodeList.map { existingNode ->
        if (namesMatch(existingNode.name, node.name)) {
            mergeLeavesIntoReference(existingNode, node)
        } else {
            existingNode
        }
    }

    private fun mergeLeavesIntoReference(reference: MutableNode, incoming: MutableNode): MutableNode {
        val root = reference.merge(listOf(incoming))
        val resolvedLeaves = resolveLeaves(reference.leaves, incoming.leaves)
        resolvedLeaves.forEach { (path, node) -> root.insertAt(Path(path.edgesList.dropLast(1)), node) }
        return root
    }

    private fun resolveLeaves(referenceLeaves: Map<Path, MutableNode>, incomingLeaves: Map<Path, MutableNode>): Map<Path, MutableNode> {
        val placedIncoming =
            incomingLeaves
                .mapKeys { (incomingPath, incomingNode) ->
                    resolveTargetPath(incomingPath, incomingNode, referenceLeaves) ?: keepOrDrop(incomingPath)
                }.filterKeys { !it.isTrivial }
        val untouchedReference = referenceLeaves.filterKeys { !placedIncoming.keys.contains(it) }

        return placedIncoming.plus(untouchedReference).mapValues { (path, incomingNode) ->
            val referenceNode = referenceLeaves[path]
            if (referenceNode == null) {
                incomingNode
            } else {
                nodesMerged++
                incomingNode.merge(listOf(referenceNode))
            }
        }
    }

    /** id (exact tree position) → unique content hash → unambiguous longest path-suffix → null. */
    private fun resolveTargetPath(incomingPath: Path, incomingNode: MutableNode, referenceLeaves: Map<Path, MutableNode>): Path? {
        val exactMatch = referenceLeaves.keys.firstOrNull { pathsEqual(it, incomingPath) }
        if (exactMatch != null) return exactMatch

        val contentMatch = uniqueContentMatch(incomingNode, referenceLeaves)
        if (contentMatch != null) return contentMatch

        return unambiguousSuffixMatch(incomingPath, referenceLeaves.keys)
    }

    private fun uniqueContentMatch(incomingNode: MutableNode, referenceLeaves: Map<Path, MutableNode>): Path? {
        val contentHash = incomingNode.checksum
        if (contentHash.isNullOrEmpty()) return null
        val matches = referenceLeaves.filterValues { it.checksum == contentHash }.keys
        return matches.singleOrNull()
    }

    private fun unambiguousSuffixMatch(incomingPath: Path, referencePaths: Set<Path>): Path? {
        val candidates = referencePaths.filter { !it.isTrivial }
        val bestFit = candidates.maxOfOrNull { suffixFit(incomingPath, it) } ?: 0
        if (bestFit == 0) return null
        return candidates.filter { suffixFit(incomingPath, it) == bestFit }.singleOrNull()
    }

    private fun keepOrDrop(incomingPath: Path): Path {
        nodesUnmatched++
        Logger.warn {
            "Could not match node '/${incomingPath.edgesList.joinToString("/")}' to the reference structure; " +
                if (addUnmatchedNodes) "keeping it as a new node." else "dropping it (use -a to keep unmatched nodes)."
        }
        return if (addUnmatchedNodes) incomingPath else Path.TRIVIAL
    }

    private fun pathsEqual(first: Path, second: Path): Boolean = first.edgesList.size == second.edgesList.size &&
        first.edgesList.indices.all { namesMatch(first.edgesList[it], second.edgesList[it]) }

    private fun suffixFit(first: Path, second: Path): Int = if (ignoreCase) {
        Path(first.edgesList.map { it.lowercase() }).fittingEdgesFromTailWith(Path(second.edgesList.map { it.lowercase() }))
    } else {
        first.fittingEdgesFromTailWith(second)
    }

    companion object {
        fun recursive(ignoreCase: Boolean = false): MergeResolverStrategy =
            MergeResolverStrategy(Mode.UNION, addUnmatchedNodes = true, ignoreCase = ignoreCase)

        fun leaf(addUnmatchedNodes: Boolean, ignoreCase: Boolean = false): MergeResolverStrategy =
            MergeResolverStrategy(Mode.OVERLAY, addUnmatchedNodes = addUnmatchedNodes, ignoreCase = ignoreCase)
    }
}
