package de.maibornwolff.codecharta.analysers.tools.analyse

import de.maibornwolff.treesitter.excavationsite.api.SharedParsing
import java.io.File
import java.util.concurrent.ConcurrentLinkedQueue
import java.util.concurrent.CountDownLatch
import java.util.concurrent.Executors
import java.util.concurrent.ThreadFactory
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicInteger
import java.util.concurrent.atomic.AtomicReference
import java.util.concurrent.atomic.AtomicReferenceArray

/**
 * Where the parsers of a [SharedFileLoop] meet: the last one to hand over its files runs the work of all of them, file
 * by file, each file on one thread inside a shared parse, while the others wait for it.
 */
internal class FileRendezvous {
    private val registered = AtomicInteger()
    private val arrived = AtomicInteger()
    private val participations = ConcurrentLinkedQueue<Participation<*>>()
    private val allDone = CountDownLatch(1)
    private val failureOfLoop = AtomicReference<Throwable>()

    fun register(): Int = registered.getAndIncrement()

    /** Waits until every registered parser has handed over its files, or none with null, and their work is done. */
    fun handOver(participation: Participation<*>?) {
        participation?.let(participations::add)
        if (arrived.incrementAndGet() == registered.get()) runAll() else allDone.await()
        failureOfLoop.get()?.let { throw it }
    }

    private fun runAll() {
        try {
            runOnePerFile(workByFile(participations.sortedBy { it.order }))
        } catch (failure: Throwable) {
            failureOfLoop.set(failure)
        } finally {
            allDone.countDown()
        }
    }

    private fun workByFile(participations: List<Participation<*>>): Collection<List<FileWork>> {
        val workByFile = LinkedHashMap<String, MutableList<FileWork>>()
        participations.forEach { participation ->
            participation.files.forEachIndexed { index, file ->
                workByFile.getOrPut(file.absoluteFile.normalize().path) { mutableListOf() }.add(FileWork(participation, index))
            }
        }
        return workByFile.values
    }

    private fun runOnePerFile(workByFile: Collection<List<FileWork>>) {
        val pool = Executors.newFixedThreadPool(Runtime.getRuntime().availableProcessors(), daemonThreads())
        try {
            workByFile.map { works -> pool.submit { SharedParsing.within { works.forEach(FileWork::run) } } }.forEach { it.get() }
        } finally {
            pool.shutdown()
            pool.awaitTermination(Long.MAX_VALUE, TimeUnit.DAYS)
        }
    }

    private fun daemonThreads(): ThreadFactory {
        val threadNumber = AtomicInteger()
        return ThreadFactory { task -> Thread(task, "$THREAD_NAME-${threadNumber.incrementAndGet()}").apply { isDaemon = true } }
    }

    companion object {
        private const val THREAD_NAME = "shared-file-loop"
    }
}

internal class Participation<R>(val order: Int, val files: List<File>, private val work: (File) -> R) {
    private val results = AtomicReferenceArray<Result<R>>(files.size)

    fun run(index: Int) {
        results[index] = runCatching { work(files[index]) }
    }

    // A failure ends the parser it belongs to, as it would on the parser's own threads
    fun results(): List<R> = List(files.size) { index -> results[index].getOrThrow() }
}

internal class FileWork(private val participation: Participation<*>, private val index: Int) {
    fun run() {
        participation.run(index)
    }
}
