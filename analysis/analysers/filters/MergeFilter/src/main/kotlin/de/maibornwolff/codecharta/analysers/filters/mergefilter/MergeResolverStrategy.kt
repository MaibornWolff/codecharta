package de.maibornwolff.codecharta.analysers.filters.mergefilter

import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeId
import de.maibornwolff.codecharta.model.NodeType
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
        val added = nodesProcessed - nodesMerged
        Logger.info {
            when (mode) {
                Mode.UNION -> "$nodesProcessed nodes were processed, $added were added and $nodesMerged were merged"
                Mode.OVERLAY -> "$nodesProcessed nodes were processed and $nodesMerged were merged ($nodesUnmatched could not be matched)"
            }
        }
        if (nodesMerged == 0) {
            Logger.warn { "No nodes were merged. Hierarchies may not match up." }
        }
    }

    // NFC-normalize before comparing so a name spelled NFD (macOS walkers) and NFC (git parsers) is
    // treated as one node. Node identity ([NodeId]) is NFC, so without this the variants survive the
    // merge as distinct siblings and then collide on one id at the 2.0 writer's duplicate-id guard.
    private fun namesMatch(first: String, second: String): Boolean =
        NodeId.normalizeName(first).equals(NodeId.normalizeName(second), ignoreCase = ignoreCase)

    // A File and a Folder that share a name are genuinely distinct nodes — they own distinct 2.0 ids, so
    // merging them would flip one's type (NodeMaxAttributeMerger.createType prefers File) or, if both were
    // kept, collide at the writer's duplicate-id guard. Refuse only that clash; every other pairing (equal
    // types, or an Unknown/absent type acting as a wildcard) merges exactly as before.
    private fun nodesMatch(first: MutableNode, second: MutableNode): Boolean =
        namesMatch(first.name, second.name) && !isFileFolderClash(first.type, second.type)

    private fun isFileFolderClash(first: NodeType?, second: NodeType?): Boolean =
        (first == NodeType.File && second == NodeType.Folder) || (first == NodeType.Folder && second == NodeType.File)

    // --- UNION (recursive) ----------------------------------------------------------------------

    private fun mergeOrAppendNode(nodeList: List<MutableNode>, node: MutableNode): List<MutableNode> {
        if (nodeList.none { nodesMatch(it, node) }) {
            return nodeList + node
        }
        nodesMerged++
        return nodeList.map { if (nodesMatch(it, node)) mergeRecursively(it, node) else it }
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
        val ambiguousIncomingHashes = ambiguousIncomingContentHashes(incomingLeaves)
        val resolvedTargets =
            incomingLeaves.mapValues { (incomingPath, incomingNode) ->
                resolveTargetPath(incomingPath, incomingNode, referenceLeaves, ambiguousIncomingHashes)
            }
        // A reference path that more than one incoming leaf resolves to is ambiguous: mapping them all
        // onto it would silently drop every leaf but the last. Refuse those matches (keep/drop with a
        // warning) instead of collapsing them — this closes the drop for content-hash AND path-suffix
        // collisions alike, not just the content-hash stage.
        val collidingTargets =
            resolvedTargets.values
                .filterNotNull()
                .groupingBy { it }
                .eachCount()
                .filterValues { it > 1 }
                .keys
        val placedIncoming =
            incomingLeaves.entries
                .associate { (incomingPath, incomingNode) ->
                    val target = resolvedTargets[incomingPath]
                    val finalPath = if (target != null && target !in collidingTargets) target else keepOrDrop(incomingPath)
                    finalPath to incomingNode
                }.filterKeys { !it.isTrivial }
        val untouchedReference = referenceLeaves.filterKeys { !placedIncoming.keys.contains(it) }

        return placedIncoming.plus(untouchedReference).mapValues { (path, incomingNode) ->
            val referenceNode = referenceLeaves[path]
            if (referenceNode == null || incomingNode === referenceNode) {
                // A newly placed incoming leaf, or an untouched reference leaf: pass it through
                // unchanged. Only a genuine incoming-onto-reference match is a merge.
                incomingNode
            } else {
                nodesMerged++
                incomingNode.merge(listOf(referenceNode))
            }
        }
    }

    /**
     * Content hashes carried by more than one incoming leaf. A rename is only inferred from content
     * when exactly one incoming leaf owns that content; when several do, resolving them all by content
     * would collapse them onto the same reference path (silently dropping all but one) or mis-merge
     * coincidentally identical boilerplate onto an unrelated node, so their content match is refused.
     */
    private fun ambiguousIncomingContentHashes(incomingLeaves: Map<Path, MutableNode>): Set<String> = incomingLeaves.values
        .mapNotNull { it.checksum?.takeIf(String::isNotEmpty) }
        .groupingBy { it }
        .eachCount()
        .filterValues { it > 1 }
        .keys

    /** id (exact tree position) → unique content hash → unambiguous longest path-suffix → null. */
    private fun resolveTargetPath(
        incomingPath: Path,
        incomingNode: MutableNode,
        referenceLeaves: Map<Path, MutableNode>,
        ambiguousIncomingHashes: Set<String>
    ): Path? {
        val exactMatch = referenceLeaves.keys.firstOrNull { pathsEqual(it, incomingPath) }
        if (exactMatch != null) return exactMatch

        val contentMatch = uniqueContentMatch(incomingNode, referenceLeaves, ambiguousIncomingHashes)
        if (contentMatch != null) return contentMatch

        return unambiguousSuffixMatch(incomingPath, referenceLeaves.keys)
    }

    private fun uniqueContentMatch(
        incomingNode: MutableNode,
        referenceLeaves: Map<Path, MutableNode>,
        ambiguousIncomingHashes: Set<String>
    ): Path? {
        val contentHash = incomingNode.checksum
        if (contentHash.isNullOrEmpty()) return null
        if (contentHash in ambiguousIncomingHashes) return null
        val matches = referenceLeaves.filterValues { it.checksum == contentHash }.keys
        return matches.singleOrNull()
    }

    private fun unambiguousSuffixMatch(incomingPath: Path, referencePaths: Set<Path>): Path? {
        val incomingEdges = normalizedEdges(incomingPath)
        val scored =
            referencePaths
                .asSequence()
                .filter { !it.isTrivial }
                .map { it to suffixFit(incomingEdges, normalizedEdges(it)) }
                .filter { it.second > 0 }
                .toList()
        val bestFit = scored.maxOfOrNull { it.second } ?: return null
        return scored.filter { it.second == bestFit }.map { it.first }.singleOrNull()
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

    // NFC-normalize (and lowercase when ignoreCase) the edge list once per path instead of re-allocating
    // it on every suffix comparison, so suffix matching stays consistent with the NFC-aware namesMatch.
    private fun normalizedEdges(path: Path): List<String> = path.edgesList.map {
        val normalized = NodeId.normalizeName(it)
        if (ignoreCase) normalized.lowercase() else normalized
    }

    private fun suffixFit(firstEdges: List<String>, secondEdges: List<String>): Int =
        Path(firstEdges).fittingEdgesFromTailWith(Path(secondEdges))

    companion object {
        fun recursive(ignoreCase: Boolean = false): MergeResolverStrategy =
            MergeResolverStrategy(Mode.UNION, addUnmatchedNodes = true, ignoreCase = ignoreCase)

        fun leaf(addUnmatchedNodes: Boolean, ignoreCase: Boolean = false): MergeResolverStrategy =
            MergeResolverStrategy(Mode.OVERLAY, addUnmatchedNodes = addUnmatchedNodes, ignoreCase = ignoreCase)
    }
}
