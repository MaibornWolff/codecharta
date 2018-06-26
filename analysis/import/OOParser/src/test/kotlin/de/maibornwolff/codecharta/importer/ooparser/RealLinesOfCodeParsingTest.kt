package de.maibornwolff.codecharta.importer.ooparser

import org.junit.Test
import java.io.IOException

import de.maibornwolff.codecharta.importer.ooparser.OOParser
import org.assertj.core.api.Assertions.assertThat
import java.io.File

class RealLinesOfCodeParsingTest {

    @Test
    @Throws(IOException::class)
    fun parsesFourRealLines() {

        val file = File(javaClass.classLoader.getResource("de/maibornwolff/codecharta/importer/ooparser/RealLinesShort.java")!!.file)

        val ooparser = OOParser(file)
        ooparser.realLinesOfCode()

        print(ooparser.realLinesOfCode())

        assertThat(ooparser.realLinesOfCode()).isEqualTo(5)

        //assertThat(true).isEqualTo(true)
    }
}
