package de.maibornwolff.codecharta.analysers.filters.mergefilter

import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.Path
import de.maibornwolff.codecharta.util.Logger

/**
 * Overlays each incoming leaf onto the reference tree by a prioritized chain — exact id (tree
 * position) → unique content hash (rename) → longest path-suffix (differently-rooted trees) → keep +
 * warn. Ambiguous content or suffix matches are skipped, never guessed; unmatched leaves are kept only
 * when [addUnmatchedNodes] is set (the `-a` flag), otherwise they are dropped with a warning.
 * Construct through [MergeResolverStrategy.leaf].
 */
internal class OverlayMergeResolver(private val addUnmatchedNodes: Boolean, ignoreCase: Boolean) : MergeResolverStrategy(ignoreCase) {
    private var nodesUnmatched = 0

    // Matches on the name alone, without the File/Folder clash guard UNION applies — deliberately.
    // This list only ever holds project roots: ProjectMerger folds one singleton [rootNode] per project,
    // and unlike UNION this step never recurses into children. So there is no sibling here to keep a
    // clashing node apart from, and the else-branch below drops rather than appends — refusing a clash
    // would silently discard the whole incoming project. Every ccsh writer roots a project at a Folder
    // named "root" (ProjectBuilder), so two roots of differing types need a hand-written 2.0 file, and
    // NodeMaxAttributeMerger.createType warns when it is handed more than one concrete type anyway.
    //
    // A File/Folder clash IS reachable deeper in this mode: mergeLeavesIntoReference re-inserts leaves
    // through NodeInserter, which also resolves parents by name, so an incoming leaf under a folder
    // `foo` nests inside a same-named reference *file* `foo`. That is a separate defect, not something
    // a guard here would catch.
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

    /**
     * The reference leaves, indexed once per merge. Each stage of [resolveTargetPath] used to rescan
     * the whole reference tree for every incoming leaf — the exact stage re-folding each candidate's
     * every edge, the suffix stage re-folding every reference path — so merging I incoming leaves over
     * R reference leaves folded R paths I times over.
     */
    private inner class ReferenceIndex(referenceLeaves: Map<Path, MutableNode>) {
        /**
         * Folded edge list → the first reference path spelled that way. Two distinct paths can fold
         * alike (an NFD and an NFC spelling, or two casings when ignoreCase); the linear scan this
         * replaces returned the first of them, so keep the first here too.
         */
        val pathByFoldedEdges: Map<List<String>, Path> =
            LinkedHashMap<List<String>, Path>().apply {
                referenceLeaves.keys.forEach { putIfAbsent(foldedEdges(it), it) }
            }

        /** Content hash → the reference paths carrying it. Blank and absent hashes are not indexed. */
        val pathsByContentHash: Map<String, List<Path>> =
            referenceLeaves.entries
                .mapNotNull { (path, node) -> node.checksum?.takeIf(String::isNotEmpty)?.let { it to path } }
                .groupBy({ it.first }, { it.second })

        /** Every non-trivial reference path with its folded edges, for suffix matching. */
        val foldedPaths: List<Pair<Path, List<String>>> =
            referenceLeaves.keys.filter { !it.isTrivial }.map { it to foldedEdges(it) }
    }

    /** id (exact tree position) → unique content hash → unambiguous longest path-suffix → null. */
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
