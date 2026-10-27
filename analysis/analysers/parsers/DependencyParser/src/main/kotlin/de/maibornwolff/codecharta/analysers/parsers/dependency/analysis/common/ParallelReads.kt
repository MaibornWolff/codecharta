package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.common

/**
 * Runs [read] for every item on all cores, to fill a cache that a serial pass reads afterwards. A failing item is left
 * to that pass, which then fails on it as it would without this read.
 */
internal fun <T> readInParallel(items: Collection<T>, read: (T) -> Unit) {
    items.parallelStream().forEach { item -> runCatching { read(item) } }
}
