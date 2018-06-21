package de.maibornwolff.codecharta.importer.ooparser

import org.junit.Test

import java.io.File
import java.io.IOException

import org.assertj.core.api.Assertions.assertThat

class RealLinesOfCodeParsingTest {

    @Test
    @Throws(IOException::class)
    fun parsesFourRealLines() {
        val file = File(javaClass.classLoader.getResource("de/richargh/jarser/RealLinesShort.java")!!.file)

        val parser = OOParser(file)

        assertThat(parser.realLinesOfCode()).isEqualTo(5)
    }

    @Test
    @Throws(IOException::class)
    fun parsesFourRealLinesWithEmptyLines() {
        val file = File(javaClass.classLoader.getResource("de/richargh/jarser/RealLinesWithEmptyLines.java")!!.file)

        val parser = OOParser(file)

        assertThat(parser.realLinesOfCode()).isEqualTo(5)
    }

    @Test
    @Throws(IOException::class)
    fun parsesFourRealLinesWithComments() {
        val file = File(javaClass.classLoader.getResource("de/richargh/jarser/RealLinesWithComments.java")!!.file)

        val parser = OOParser(file)

        assertThat(parser.realLinesOfCode()).isEqualTo(5)
    }

    @Test
    @Throws(IOException::class)
    fun parsesLongerRealLines() {
        val file = File(javaClass.classLoader.getResource("de/richargh/jarser/RealLinesLonger.java")!!.file)

        val parser = OOParser(file)

        assertThat(parser.realLinesOfCode()).isEqualTo(16)
    }
}
