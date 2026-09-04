package de.maibornwolff.codecharta.analysers.parsers.dependency.progress

import java.io.Closeable

interface ProgressReporter : Closeable {
    fun startPhase(phaseName: String, totalItems: Long?)

    fun advance(completedItems: Long = 1)

    fun completePhase()
}
