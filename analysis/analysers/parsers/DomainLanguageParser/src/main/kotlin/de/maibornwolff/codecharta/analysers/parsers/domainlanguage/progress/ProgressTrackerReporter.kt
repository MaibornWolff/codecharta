package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.progress

import de.maibornwolff.codecharta.progresstracker.ParsingUnit
import de.maibornwolff.codecharta.progresstracker.ProgressTracker
import java.util.concurrent.atomic.AtomicLong

class ProgressTrackerReporter(private val parsingUnit: ParsingUnit = ParsingUnit.Files) : ProgressReporter {
    private var progressTracker = ProgressTracker()
    private var totalItemsInPhase: Long = 0
    private val completedItemsInPhase = AtomicLong(0)

    override fun startPhase(phaseName: String, totalItems: Long?) {
        this.totalItemsInPhase = totalItems ?: 0
        this.completedItemsInPhase.set(0)
        restartEtaBaseline()
        System.err.println(phaseName)
        if (this.totalItemsInPhase > 0) {
            progressTracker.updateProgress(this.totalItemsInPhase, 0, parsingUnit.name)
        }
    }

    override fun advance(completedItems: Long) {
        val completedSoFar = completedItemsInPhase.addAndGet(completedItems)
        if (totalItemsInPhase > 0) {
            progressTracker.updateProgress(totalItemsInPhase, completedSoFar, parsingUnit.name)
        }
    }

    override fun completePhase() {
        if (totalItemsInPhase > 0) {
            progressTracker.updateProgress(totalItemsInPhase, totalItemsInPhase, parsingUnit.name)
            System.err.println()
        }
    }

    override fun close() = Unit

    private fun restartEtaBaseline() {
        this.progressTracker = ProgressTracker()
    }
}
