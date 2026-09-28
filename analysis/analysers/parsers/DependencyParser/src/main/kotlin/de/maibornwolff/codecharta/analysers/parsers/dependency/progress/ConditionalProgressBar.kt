package de.maibornwolff.codecharta.analysers.parsers.dependency.progress

import de.maibornwolff.codecharta.progresstracker.ParsingUnit
import de.maibornwolff.codecharta.progresstracker.ProgressTracker
import de.maibornwolff.codecharta.util.Logger
import java.util.concurrent.atomic.AtomicLong

/**
 * A progress bar that only draws itself when a phase is large enough to be worth watching.
 *
 * Levelization recurses once per folder, so most phases finish instantly and a bar per phase would
 * bury the output; [shouldReport] decides per phase. Steps arrive from parallel streams, so the
 * counter is atomic.
 */
class ConditionalProgressBar(
    private val name: String,
    private val steps: Int,
    private val unit: ParsingUnit = ParsingUnit.Packages,
    private val shouldReport: () -> Boolean
) {
    fun <T> use(block: (step: () -> Unit) -> T): T {
        if (!shouldReport()) return block {}

        Logger.info { "'$name' consists of $steps steps. This might take a while." }
        val progressTracker = ProgressTracker()
        val completed = AtomicLong(0)
        val result = block { progressTracker.updateProgress(steps.toLong(), completed.incrementAndGet(), unit.name) }
        System.err.println()
        return result
    }
}
