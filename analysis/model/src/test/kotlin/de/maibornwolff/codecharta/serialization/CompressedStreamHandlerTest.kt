package de.maibornwolff.codecharta.serialization

import org.hamcrest.MatcherAssert
import org.hamcrest.Matchers
import org.spekframework.spek2.Spek
import org.spekframework.spek2.style.specification.describe

class CompressedStreamHandlerTest : Spek({
    val EXAMPLE_COMPRESSED = "example.txt.gz"
    val EXAMPLE_UNCOMPRESSED = "example.txt"
    val EXAMPLE_EMPTY = "exampleEmpty"
    val EXAMPLE_ONE_BYTE = "exampleOneByte"

    describe("A GZ-Compression InputStream Checker") {
        it("should be able to read text from compressed input stream") {
            var input = this.javaClass.classLoader.getResourceAsStream(EXAMPLE_COMPRESSED)
            input = CompressedStreamHandler.handleInput(input)
            val content = input.reader().readText()
            MatcherAssert.assertThat(content, Matchers.`is`("hello world\n"))
            input.close()
        }

        it("should be able to read text from uncompressed input stream") {
            var input = this.javaClass.classLoader.getResourceAsStream(EXAMPLE_UNCOMPRESSED)
            input = CompressedStreamHandler.handleInput(input)
            val content = input.reader().readText()
            MatcherAssert.assertThat(content, Matchers.`is`("hello world\n"))
            input.close()
        }

        it("should be able to handle empty files") {
            var input = this.javaClass.classLoader.getResourceAsStream(EXAMPLE_EMPTY)
            input = CompressedStreamHandler.handleInput(input)
            val content = input.reader().readText()
            MatcherAssert.assertThat(content, Matchers.`is`(""))
            input.close()
        }

        it("should be able to handle one byte files") {
            var input = this.javaClass.classLoader.getResourceAsStream(EXAMPLE_ONE_BYTE)
            input = CompressedStreamHandler.handleInput(input)
            val content = input.read()
            MatcherAssert.assertThat(content, Matchers.`is`(0))
            input.close()
        }
    }
})
