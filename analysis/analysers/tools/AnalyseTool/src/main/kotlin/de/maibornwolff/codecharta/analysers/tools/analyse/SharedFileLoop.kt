package de.maibornwolff.codecharta.analysers.tools.analyse

import de.maibornwolff.codecharta.analysers.analyserinterface.scan.FileLoop
import java.io.File
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.atomic.AtomicBoolean

/**
 * One file loop for the tree-sitter parsers of ccsh analyse -p, so they parse each file once instead of once each. It
 * waits until every parser has handed over its files or ended without, then does the work of all of them on a file
 * together on one thread, where they share its parse. Each parser gets back its own results in the order of its files.
 * Only for parsers that run at the same time: a parser that waits for the others blocks its thread until they arrive.
 */
class SharedFileLoop {
    private val rendezvous = FileRendezvous()
    private val participants = ConcurrentHashMap<String, Participant>()

    /** The loop of the parser called [name]; every parser asks before any of them runs. */
    fun participant(name: String): FileLoop = participants.computeIfAbsent(name) { Participant(rendezvous, rendezvous.register()) }

    /** The parser called [name] ended; if it never handed over its files, the others no longer wait for it. */
    fun leave(name: String) {
        participants[name]?.leave()
    }
}

private class Participant(private val rendezvous: FileRendezvous, private val order: Int) : FileLoop {
    private val hasArrived = AtomicBoolean()

    override fun <R> map(files: List<File>, work: (File) -> R): List<R> {
        if (!hasArrived.compareAndSet(false, true)) return files.parallelStream().map { work(it) }.toList()
        val participation = Participation(order, files, work)
        rendezvous.handOver(participation)
        return participation.results()
    }

    fun leave() {
        if (hasArrived.compareAndSet(false, true)) rendezvous.handOver(null)
    }
}
