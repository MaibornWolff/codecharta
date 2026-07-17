package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.progress

import de.maibornwolff.codecharta.progresstracker.ParsingUnit
import de.maibornwolff.codecharta.progresstracker.ProgressTracker
import java.util.concurrent.atomic.AtomicLong

/**
 * Progress reporter backed by codecharta's shared [ProgressTracker], replacing the mordant-based
 * implementation. It renders a determinate progress bar to stderr; indeterminate phases (unknown
 * total) report no bar, matching [ProgressTracker]'s contract.
 */
class ProgressTrackerReporter(private val parsingUnit: ParsingUnit = ParsingUnit.Files) : ProgressReporter {
    private var progressTracker = ProgressTracker()
    private var total: Long = 0
    private val parsed = AtomicLong(0)

    override fun startPhase(phaseName: String, total: Long?) {
        this.total = total ?: 0
        this.parsed.set(0)
        // Reset the tracker so its ETA baseline restarts with each phase.
        this.progressTracker = ProgressTracker()
        System.err.println(phaseName)
        if (this.total > 0) {
            progressTracker.updateProgress(this.total, 0, parsingUnit.name)
        }
    }

    override fun advance(count: Long) {
        val done = parsed.addAndGet(count)
        if (total > 0) {
            progressTracker.updateProgress(total, done, parsingUnit.name)
        }
    }

    override fun completePhase() {
        if (total > 0) {
            progressTracker.updateProgress(total, total, parsingUnit.name)
            System.err.println()
        }
    }

    override fun close() = Unit
}
