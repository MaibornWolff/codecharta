package de.maibornwolff.codecharta.analysers.filters.mergefilter

import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.Path
import de.maibornwolff.codecharta.util.Logger

internal class OverlayMergeResolver(private val addUnmatchedNodes: Boolean, ignoreCase: Boolean) : MergeResolverStrategy(ignoreCase) {
    private var nodesUnmatched = 0

    // No File/Folder clash guard here — this only folds project roots, and dropping rather than
    // appending is deliberate for clashing root types.
    override fun mergeNode(nodeList: List<MutableNode>, node: MutableNode): List<MutableNode> = nodeList.map { existingNode ->
        if (namesMatch(existingNode.name, node.name)) {
            mergeLeavesIntoReference(existingNode, node)
        } else {
            existingNode
        }
    }

    override fun statsMessage(): String =
        "$nodesProcessed nodes were processed and $nodesMerged were merged ($nodesUnmatched could not be matched)"

    private fun mergeLeavesIntoReference(reference: MutableNode, incoming: MutableNode): MutableNode {
        val root = reference.merge(listOf(incoming))
        val resolvedLeaves = resolveLeaves(reference.leaves, incoming.leaves)
        resolvedLeaves.forEach { (path, node) -> root.insertAt(Path(path.edgesList.dropLast(1)), node) }
        return root
    }

    private fun resolveLeaves(referenceLeaves: Map<Path, MutableNode>, incomingLeaves: Map<Path, MutableNode>): Map<Path, MutableNode> {
        val ambiguousIncomingHashes = ambiguousIncomingContentHashes(incomingLeaves)
        val reference = ReferenceIndex(referenceLeaves)
        val resolvedTargets =
            incomingLeaves.mapValues { (incomingPath, incomingNode) ->
                resolveTargetPath(incomingPath, incomingNode, reference, ambiguousIncomingHashes)
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

    private fun ambiguousIncomingContentHashes(incomingLeaves: Map<Path, MutableNode>): Set<String> = incomingLeaves.values
        .mapNotNull { it.checksum?.takeIf(String::isNotEmpty) }
        .groupingBy { it }
        .eachCount()
        .filterValues { it > 1 }
        .keys

    private inner class ReferenceIndex(referenceLeaves: Map<Path, MutableNode>) {
        val pathByFoldedEdges: Map<List<String>, Path> =
            LinkedHashMap<List<String>, Path>().apply {
                referenceLeaves.keys.forEach { putIfAbsent(foldedEdges(it), it) }
            }

        val pathsByContentHash: Map<String, List<Path>> =
            referenceLeaves.entries
                .mapNotNull { (path, node) -> node.checksum?.takeIf(String::isNotEmpty)?.let { it to path } }
                .groupBy({ it.first }, { it.second })

        val foldedPaths: List<Pair<Path, List<String>>> =
            referenceLeaves.keys.filter { !it.isTrivial }.map { it to foldedEdges(it) }
    }

    private fun resolveTargetPath(
        incomingPath: Path,
        incomingNode: MutableNode,
        reference: ReferenceIndex,
        ambiguousIncomingHashes: Set<String>
    ): Path? {
        val exactMatch = reference.pathByFoldedEdges[foldedEdges(incomingPath)]
        if (exactMatch != null) return exactMatch

        val contentMatch = uniqueContentMatch(incomingNode, reference, ambiguousIncomingHashes)
        if (contentMatch != null) return contentMatch

        return unambiguousSuffixMatch(incomingPath, reference)
    }

    private fun uniqueContentMatch(incomingNode: MutableNode, reference: ReferenceIndex, ambiguousIncomingHashes: Set<String>): Path? {
        val contentHash = incomingNode.checksum
        if (contentHash.isNullOrEmpty()) return null
        if (contentHash in ambiguousIncomingHashes) return null
        return reference.pathsByContentHash[contentHash]?.singleOrNull()
    }

    private fun unambiguousSuffixMatch(incomingPath: Path, reference: ReferenceIndex): Path? {
        val incomingEdges = foldedEdges(incomingPath)
        val scored =
            reference.foldedPaths
                .map { (path, referenceEdges) -> path to suffixFit(incomingEdges, referenceEdges) }
                .filter { it.second > 0 }
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

    // Path.fittingEdgesFromTailWith over edge lists that are already folded, so a comparison neither
    // re-folds a name nor allocates the two Path objects that wrapping them back up would cost.
    private fun suffixFit(firstEdges: List<String>, secondEdges: List<String>): Int {
        val minSize = minOf(firstEdges.size, secondEdges.size)
        return (0 until minSize).firstOrNull {
            firstEdges[firstEdges.size - (it + 1)] != secondEdges[secondEdges.size - (it + 1)]
        } ?: minSize
    }
}
