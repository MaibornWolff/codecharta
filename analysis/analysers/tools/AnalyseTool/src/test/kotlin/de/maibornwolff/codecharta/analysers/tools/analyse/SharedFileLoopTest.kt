package de.maibornwolff.codecharta.analysers.tools.analyse

import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Timeout
import java.io.File
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.Executors
import java.util.concurrent.Future

@Timeout(LOOP_TIMEOUT_SECONDS)
class SharedFileLoopTest {
    private val threadPool = Executors.newCachedThreadPool()

    private fun <T> inParallel(vararg runs: () -> T): List<T> = runs
        .map { run -> threadPool.submit<T> { run() } }
        .map(Future<T>::get)

    @Test
    fun `should do the work of every parser on a file on the same thread`() {
        // Arrange
        val loop = SharedFileLoop()
        val first = loop.participant("first")
        val second = loop.participant("second")
        val threadOf = ConcurrentHashMap<String, String>()
        val shared = File("Shared.kt")

        // Act
        inParallel(
            { first.map(listOf(shared, File("OnlyFirst.kt"))) { file -> threadOf["first ${file.name}"] = Thread.currentThread().name } },
            { second.map(listOf(shared)) { file -> threadOf["second ${file.name}"] = Thread.currentThread().name } }
        )

        // Assert
        assertThat(threadOf.keys).containsExactlyInAnyOrder("first Shared.kt", "first OnlyFirst.kt", "second Shared.kt")
        assertThat(threadOf["second Shared.kt"]).isEqualTo(threadOf["first Shared.kt"])
    }

    @Test
    fun `should hand each parser its own results in the order of its files`() {
        // Arrange
        val loop = SharedFileLoop()
        val first = loop.participant("first")
        val second = loop.participant("second")
        val files = listOf("c.kt", "a.kt", "b.kt").map(::File)

        // Act
        val results = inParallel(
            { first.map(files) { it.name } },
            { second.map(files.reversed()) { it.name.length } }
        )

        // Assert
        assertThat(results).containsExactly(listOf("c.kt", "a.kt", "b.kt"), listOf(4, 4, 4))
    }

    @Test
    fun `should not wait for a parser that ended without handing over its files`() {
        // Arrange
        val loop = SharedFileLoop()
        val first = loop.participant("first")
        loop.participant("second")

        // Act
        val results = inParallel({ first.map(listOf(File("a.kt"))) { it.name } }, { loop.leave("second") })

        // Assert
        assertThat(results.first()).isEqualTo(listOf("a.kt"))
    }

    @Test
    fun `should end only the parser whose work failed`() {
        // Arrange
        val loop = SharedFileLoop()
        val failing = loop.participant("failing")
        val healthy = loop.participant("healthy")
        val file = File("a.kt")
        val failure = IllegalStateException("broken")
        val failingRun = threadPool.submit<List<String>> { failing.map(listOf(file)) { throw failure } }

        // Act
        val healthyResults = healthy.map(listOf(file)) { it.name }

        // Assert
        assertThat(healthyResults).containsExactly("a.kt")
        assertThatThrownBy { failingRun.get() }.hasCause(failure)
    }

    @Test
    fun `should run a second use of the same loop on its own`() {
        // Arrange
        val loop = SharedFileLoop()
        val only = loop.participant("only")
        only.map(listOf(File("a.kt"))) { it.name }

        // Act
        val results = only.map(listOf(File("b.kt"), File("c.kt"))) { it.name }

        // Assert
        assertThat(results).containsExactly("b.kt", "c.kt")
    }
}

private const val LOOP_TIMEOUT_SECONDS = 10L
