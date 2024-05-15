package de.maibornwolff.codecharta.serialization

import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import kotlin.test.assertSame

class CompressedStreamHandlerTest {
    companion object {
        private const val EXAMPLE_COMPRESSED = "exampleCompressed.txt.gz"
        private const val EXAMPLE_UNCOMPRESSED = "exampleUncompressed.txt"
        private const val EXAMPLE_EMPTY = "exampleEmpty"
        private const val EXAMPLE_ONE_BYTE = "exampleOneByte"
    }

    @Test
    fun `should be able to read text from compressed input stream`() {
        var input = this.javaClass.classLoader.getResourceAsStream(EXAMPLE_COMPRESSED)
        input = CompressedStreamHandler.wrapInput(input)
        val content = input.reader().readText()
        assertEquals("hello world\n", content)
        input.close()
    }

    @Test
    fun `should be able to read text from uncompressed input stream`() {
        var input = this.javaClass.classLoader.getResourceAsStream(EXAMPLE_UNCOMPRESSED)
        input = CompressedStreamHandler.wrapInput(input)
        val content = input.reader().readText()
        assertEquals("hello world\n", content)
        input.close()
    }

    @Test
    fun `should be able to handle empty files`() {
        var input = this.javaClass.classLoader.getResourceAsStream(EXAMPLE_EMPTY)
        input = CompressedStreamHandler.wrapInput(input)
        val content = input.reader().readText()
        assertEquals("", content)
        input.close()
    }

    @Test
    fun `should be able to handle one byte files`() {
        var input = this.javaClass.classLoader.getResourceAsStream(EXAMPLE_ONE_BYTE)
        input = CompressedStreamHandler.wrapInput(input)
        val content = input.read()
        assertSame(0, content)
        input.close()
    }
}
