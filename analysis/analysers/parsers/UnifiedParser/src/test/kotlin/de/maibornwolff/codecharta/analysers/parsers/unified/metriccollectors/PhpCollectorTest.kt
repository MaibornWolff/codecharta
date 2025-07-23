package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.AvailableMetrics
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.treesitter.TSParser
import org.treesitter.TreeSitterPhp
import java.io.File

class PhpCollectorTest {
    private var parser = TSParser()
    private val collector = PhpCollector()

    @BeforeEach
    fun setUp() {
        parser.setLanguage(TreeSitterPhp())
    }

    private fun createTestFile(content: String): File {
        val tempFile = File.createTempFile("testFile", ".txt")
        tempFile.writeText(content)
        tempFile.deleteOnExit()
        return tempFile
    }

    @Test
    fun `should count else if clause for complexity`() {
        // given
        val fileContent = """
            <?php
            if (${'$'}x == 1) {
                echo "one";
            } elseif (${'$'}x == 2) {
                echo "two";
            } else {
                echo "other";
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableMetrics.COMPLEXITY.metricName]).isEqualTo(2)
    }

    @Test
    fun `should count foreach statement for complexity`() {
        // given
        val fileContent = """
            <?php
            foreach (${'$'}items as ${'$'}item) {
                echo ${'$'}item;
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableMetrics.COMPLEXITY.metricName]).isEqualTo(1)
    }

    @Test
    fun `should count conditional expression for complexity`() {
        // given
        val fileContent = """<?php ${'$'}x = (${'$'}y > 0) ? 1 : -1; ?>"""
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableMetrics.COMPLEXITY.metricName]).isEqualTo(1)
    }

    @Test
    fun `should count 'and' and 'or' patterns for complexity`() {
        // given
        val fileContent = """<?php if (${'$'}x > 0 and ${'$'}y > 0 or ${'$'}z > 0) { echo "test"; } ?>"""
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableMetrics.COMPLEXITY.metricName]).isEqualTo(3)
    }

    @Test
    fun `should count binary expressions with && operator for complexity`() {
        // given
        val fileContent = """<?php if (${'$'}x > 0 && ${'$'}y < 10) { echo "test"; } ?>"""
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableMetrics.COMPLEXITY.metricName]).isEqualTo(2)
    }

    @Test
    fun `should count null coalescing operator for complexity`() {
        // given
        val fileContent = """<?php ${'$'}result = ${'$'}name ?? "default"; ?>"""
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableMetrics.COMPLEXITY.metricName]).isEqualTo(1)
    }

    @Test
    fun `should count case statement for complexity`() {
        // given
        val fileContent = """
            <?php
            switch (${'$'}value) {
                case 1:
                    echo "one";
                    break;
                case 2:
                    echo "two";
                    break;
                default:
                    echo "other";
                    break;
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableMetrics.COMPLEXITY.metricName]).isEqualTo(3)
    }

    @Test
    fun `should count conditional match for complexity`() {
        // given
        val fileContent = """
            <?php
            ${'$'}result = match(${'$'}value) {
                1 => "one",
                2 => "two",
                default => "other"
            };
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableMetrics.COMPLEXITY.metricName]).isEqualTo(3)
    }

    @Test
    fun `should count arrow function for complexity`() {
        // given
        val fileContent = """<?php ${'$'}func = fn(${'$'}a, ${'$'}b) => ${'$'}a + ${'$'}b; ?>"""
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableMetrics.COMPLEXITY.metricName]).isEqualTo(1)
    }

    @Test
    fun `should count anonymous function creation for complexity`() {
        // given
        val fileContent = """
            <?php
            ${'$'}func = function(${'$'}x) {
                return ${'$'}x * 2;
            };
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableMetrics.COMPLEXITY.metricName]).isEqualTo(1)
    }

    @Test
    fun `should count static function for complexity`() {
        // given
        val fileContent = """
            <?php
            class MyClass {
                public static function staticMethod() {
                    return "static";
                }
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableMetrics.COMPLEXITY.metricName]).isEqualTo(1)
    }

    @Test
    fun `should count line and block comments for comment_lines`() {
        // given
        val fileContent = """
            <?php
            /**
             * docstring comment
             * over
             * multiple lines
             */
             function helloWorld() {
                 //line comment
                 echo "Hello"; /* comment in code */ echo "world";
             }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableMetrics.COMMENT_LINES.metricName]).isEqualTo(7)
    }

    @Test
    fun `should not include comments or empty lines for rloc`() {
        // given
        val fileContent = """
            <?php
            if (${'$'}x == 2) {
                // comment


                return true;
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableMetrics.REAL_LINES_OF_CODE.metricName]).isEqualTo(4)
    }

    @Test
    fun `should count empty lines and comments for loc`() {
        // given
        val fileContent = """
            <?php
            if (${'$'}x == 2) {
                // comment


                return true;
            }
        """.trimIndent() + "\n" // this newline simulates end of file
        val input = createTestFile(fileContent)

        // when
        val result = collector.collectMetricsForFile(input)

        // then
        Assertions.assertThat(result.attributes[AvailableMetrics.LINES_OF_CODE.metricName]).isEqualTo(7)
    }
}
