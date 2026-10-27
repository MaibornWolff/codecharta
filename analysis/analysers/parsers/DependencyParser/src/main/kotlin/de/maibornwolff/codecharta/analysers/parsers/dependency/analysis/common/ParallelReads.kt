package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.common

/**
 * Runs [read] for every item on all cores, to fill a cache that a serial pass reads afterwards. A failing item is left
 * to that pass, which then fails on it as it would without this read.
 */
internal fun <T> readInParallel(items: Collection<T>, read: (T) -> Unit) {
    items.parallelStream().forEach { item -> runCatching { read(item) } }
}

/** [transform] of every item, computed on all cores, in the order of the items. */
internal fun <T, R> mapInParallel(items: List<T>, transform: (T) -> R): List<R> = items.parallelStream().map(transform).toList()
