package de.maibornwolff.codecharta.analysers.filters.structuremodifier

import com.google.gson.JsonElement
import com.google.gson.JsonObject
import de.maibornwolff.codecharta.model.LensSet
import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.model.NodeId
import de.maibornwolff.codecharta.model.NodeType

/**
 * The `domain` lens is keyed by a hash of each node's canonical path, so restructuring the tree
 * invalidates every key. An id cannot be reversed into its path, so the *old* tree is walked to recover
 * which path each id stood for, [remapSegments] maps that path the way the action re-pathed the node,
 * and the entry is re-keyed under the id the node now has. A node that did not survive returns null and
 * its entry is dropped, so no key is left pointing at nothing.
 */
class DomainLensRekeyer(private val remapSegments: (List<String>) -> List<String>?) {
    fun rekey(oldRoot: Node, opaqueLenses: Map<String, JsonElement>): Map<String, JsonElement> {
        val oldNodes = domainNodesOf(opaqueLenses) ?: return opaqueLenses

        val newIdByOldId = buildIdMapping(oldRoot)
        val rekeyedNodes = JsonObject()
        oldNodes.entrySet().forEach { (oldId, entry) ->
            val newId = newIdByOldId[oldId] ?: return@forEach
            // A move can land a node on a path that already had an entry; the tree keeps the node that
            // was already there, so its entry wins here too.
            if (!rekeyedNodes.has(newId)) rekeyedNodes.add(newId, entry)
        }

        val rekeyedDomain = JsonObject()
        rekeyedDomain.add(NODES_KEY, rekeyedNodes)
        return opaqueLenses + (LensSet.DOMAIN_KEY to rekeyedDomain)
    }

    private fun domainNodesOf(opaqueLenses: Map<String, JsonElement>): JsonObject? {
        val domain = opaqueLenses[LensSet.DOMAIN_KEY] ?: return null
        if (!domain.isJsonObject) return null
        val nodes = domain.asJsonObject.get(NODES_KEY) ?: return null
        return if (nodes.isJsonObject) nodes.asJsonObject else null
    }

    private fun buildIdMapping(oldRoot: Node): Map<String, String> {
        val mapping = mutableMapOf<String, String>()
        collectInto(oldRoot, emptyList(), mapping)
        return mapping
    }

    // The root node carries no segment of its own, matching how ProjectToCcJsonV2Mapper assigns ids.
    private fun collectInto(node: Node, segments: List<String>, mapping: MutableMap<String, String>) {
        val type = node.type ?: NodeType.File
        remapSegments(segments)?.let { newSegments ->
            mapping[NodeId.fromSegments(segments, type)] = NodeId.fromSegments(newSegments, type)
        }
        node.children.forEach { child -> collectInto(child, segments + child.name, mapping) }
    }

    companion object {
        private const val NODES_KEY = "nodes"
        private const val ROOT_SEGMENT = "root"

        fun forSetRoot(setRootPath: String): DomainLensRekeyer {
            val extractedPrefix = segmentsBelowRoot(setRootPath)
            return DomainLensRekeyer { segments ->
                if (startsWith(segments, extractedPrefix)) segments.drop(extractedPrefix.size) else null
            }
        }

        fun forRemove(removedPaths: Array<String>): DomainLensRekeyer {
            val removedPrefixes = removedPaths.map { segmentsBelowRoot(it) }.filter { it.isNotEmpty() }
            return DomainLensRekeyer { segments ->
                // Removing does not re-path what survives; it only takes subtrees away.
                if (removedPrefixes.any { startsWith(segments, it) }) null else segments
            }
        }

        fun forMove(moveFrom: String, moveTo: String): DomainLensRekeyer {
            val origin = segmentsBelowRoot(moveFrom)
            val destination = segmentsBelowRoot(moveTo)
            return DomainLensRekeyer { segments ->
                when {
                    // The destination receives exactly the moved folder's children, so it is that
                    // folder's successor and inherits its word bank — unless it already existed with
                    // one of its own, which `rekey` keeps.
                    segments == origin -> destination
                    startsWith(segments, origin) -> destination + segments.drop(origin.size)
                    else -> segments
                }
            }
        }

        private fun segmentsBelowRoot(path: String): List<String> {
            val segments = path.split("/").filter { it.isNotEmpty() }
            return if (segments.firstOrNull() == ROOT_SEGMENT) segments.drop(1) else segments
        }

        private fun startsWith(segments: List<String>, prefix: List<String>): Boolean =
            prefix.isNotEmpty() && segments.size >= prefix.size && segments.subList(0, prefix.size) == prefix
    }
}
