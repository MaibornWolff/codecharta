package de.maibornwolff.codecharta.analysers.filters.structuremodifier

import de.maibornwolff.codecharta.model.SegmentRemapping

/**
 * How each restructuring action `ccsh modify` offers re-paths a node, expressed as the [SegmentRemapping]
 * the domain lens needs to re-key itself onto the restructured tree.
 */
object DomainPathRemapper {
    private const val ROOT_SEGMENT = "root"

    fun forSetRoot(setRootPath: String): SegmentRemapping {
        val extractedPrefix = segmentsBelowRoot(setRootPath)
        return { segments -> if (startsWith(segments, extractedPrefix)) segments.drop(extractedPrefix.size) else null }
    }

    fun forRemove(removedPaths: Array<String>): SegmentRemapping {
        val removedPrefixes = removedPaths.map { segmentsBelowRoot(it) }.filter { it.isNotEmpty() }
        // Removing does not re-path what survives; it only takes subtrees away.
        return { segments -> if (removedPrefixes.any { startsWith(segments, it) }) null else segments }
    }

    fun forMove(moveFrom: String, moveTo: String): SegmentRemapping {
        val origin = segmentsBelowRoot(moveFrom)
        val destination = segmentsBelowRoot(moveTo)
        return { segments ->
            when {
                // The destination receives exactly the moved folder's children, so it is that folder's
                // successor and inherits its word bank — unless it already existed with one of its own,
                // which the re-key keeps.
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
