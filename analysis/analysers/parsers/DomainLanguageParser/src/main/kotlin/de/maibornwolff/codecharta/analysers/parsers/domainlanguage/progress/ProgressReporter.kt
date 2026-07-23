package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.progress

import java.io.Closeable

/**
 * Reports progress for long-running operations.
 * Implementations must be thread-safe for concurrent updates from coroutines.
 */
interface ProgressReporter : Closeable {
    /**
     * Start a new progress phase.
     * @param phaseName Display name for this phase (e.g., "Scanning files")
     * @param total Total number of items to process, or null for indeterminate progress
     */
    fun startPhase(phaseName: String, total: Long?)

    /**
     * Report progress on current phase. Thread-safe for concurrent calls.
     * @param count Number of items completed (default 1)
     */
    fun advance(count: Long = 1)

    fun completePhase()
}
