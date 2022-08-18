package de.maibornwolff.codecharta.filter.edgefilter

import de.maibornwolff.codecharta.filter.edgefilter.EdgeFilter.Companion.main
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.io.File

class EdgeFilterTest {
    @Test
    fun `should create json uncompressed file`() {
        main(
            arrayOf(
                "src/test/resources/coupling.json", "-o=src/test/resources/output"
            )
        )
        val file = File("src/test/resources/output.cc.json")
        file.deleteOnExit()

        assertTrue(file.exists())
    }
}
