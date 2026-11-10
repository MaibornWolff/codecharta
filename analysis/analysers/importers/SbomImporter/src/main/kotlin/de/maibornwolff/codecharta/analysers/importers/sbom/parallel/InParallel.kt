package de.maibornwolff.codecharta.analysers.importers.sbom.parallel

import java.util.concurrent.Callable
import java.util.concurrent.Executors

private const val LOOKUP_THREADS = 8

/** Runs a blocking lookup per item on a few threads and returns the results in the order of the items. */
fun <T, R> List<T>.inParallel(lookup: (T) -> R): List<R> {
    if (isEmpty()) return emptyList()
    val executor = Executors.newFixedThreadPool(minOf(LOOKUP_THREADS, size))
    try {
        return executor.invokeAll(map { item -> Callable { lookup(item) } }).map { it.get() }
    } finally {
        executor.shutdownNow()
    }
}
