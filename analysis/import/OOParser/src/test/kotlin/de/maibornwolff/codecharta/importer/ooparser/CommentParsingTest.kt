package de.maibornwolff.codecharta.importer.ooparser

import org.junit.Test

import java.io.File
import java.io.IOException
import de.maibornwolff.codecharta.importer.ooparser.OOParserMain

import org.assertj.core.api.Assertions.assertThat

class CommentParsingTest {

    @Test
    @Throws(IOException::class)
    fun findsAllSimpleComments() {
        val file = File(javaClass.classLoader.getResource("SourceCodeSimple.java")!!.file)

        val parser = OOParserMain(file)

        assertThat(parser.comments().size()).isEqualTo(3)
    }

}
