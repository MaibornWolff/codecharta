package de.maibornwolff.codecharta.model

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Test

class ChecksumCalculatorTest {
    @Test
    fun `should return null for empty file content`() {
        val checksum = ChecksumCalculator.calculateChecksum("")
        assertNull(checksum)
    }

    @Test
    fun `should produce same checksum for identical file content`() {
        val content1 = "public class Test {\n    void method() {}\n}"
        val content2 = "public class Test {\n    void method() {}\n}"

        val checksum1 = ChecksumCalculator.calculateChecksum(content1)
        val checksum2 = ChecksumCalculator.calculateChecksum(content2)

        assertEquals(checksum1, checksum2)
    }

    @Test
    fun `should produce different checksums for different file content`() {
        val content1 = "public class Test {\n    void method() {}\n}"
        val content2 = "public class Test {\n    void method2() {}\n}"

        val checksum1 = ChecksumCalculator.calculateChecksum(content1)
        val checksum2 = ChecksumCalculator.calculateChecksum(content2)

        assertNotEquals(checksum1, checksum2)
    }

    @Test
    fun `should produce different checksums for content with different whitespace`() {
        val content1 = "public class Test {\n    void method() {}\n}"
        val content2 = "public class Test {\n        void method() {}\n}"

        val checksum1 = ChecksumCalculator.calculateChecksum(content1)
        val checksum2 = ChecksumCalculator.calculateChecksum(content2)

        assertNotEquals(checksum1, checksum2, "Checksums should differ when whitespace differs")
    }

    @Test
    fun `should handle multi-line content`() {
        val content = """
            public class Example {
                private int value;
                
                public Example(int value) {
                    this.value = value;
                }
                
                public int getValue() {
                    return value;
                }
            }
        """.trimIndent()

        val checksum = ChecksumCalculator.calculateChecksum(content)

        assert(checksum != null)
        assert(checksum!!.isNotEmpty())
    }

    @Test
    fun `should handle special characters`() {
        val content = "// Special chars: äöü ß € @ # $ % & * ( ) [ ] { } < > | \\ / ? ! ~ ` ' \""

        val checksum = ChecksumCalculator.calculateChecksum(content)

        assert(checksum != null)
        assert(checksum!!.isNotEmpty())
    }

    @Test
    fun `should produce different checksums when content is modified`() {
        val content1 = "function test() { return 42; }"
        val content2 = "function test() { return 43; }"

        val checksum1 = ChecksumCalculator.calculateChecksum(content1)
        val checksum2 = ChecksumCalculator.calculateChecksum(content2)

        assertNotEquals(checksum1, checksum2)
    }

    @Test
    fun `should produce hexadecimal string`() {
        val content = "test content"

        val checksum = ChecksumCalculator.calculateChecksum(content)

        assert(checksum != null)
        assert(checksum!!.matches(Regex("^[0-9a-f]+$")))
    }

    @Test
    fun `should handle very long content`() {
        val content = "a".repeat(10000)

        val checksum = ChecksumCalculator.calculateChecksum(content)

        assert(checksum != null)
        assert(checksum!!.isNotEmpty())
    }

    @Test
    fun `should handle unicode content`() {
        val content = "Hello 世界 مرحبا мир 🌍"

        val checksum = ChecksumCalculator.calculateChecksum(content)

        assert(checksum != null)
        assert(checksum!!.isNotEmpty())
    }
}
