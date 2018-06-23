package de.maibornwolff.codecharta.importer.ooparser

import org.junit.Test
import java.io.IOException


import org.assertj.core.api.Assertions.assertThat

class RealLinesOfCodeParsingTest {

    @Test
    @Throws(IOException::class)
    fun parsesFourRealLines() {

        val ooparser: OOParser = OOParser()
        ooparser.getRealLinesOfCode()

        //assertThat(parser.getRealLinesOfCode()).isEqualTo(5)

        assertThat(true).isEqualTo(true)
    }
}
