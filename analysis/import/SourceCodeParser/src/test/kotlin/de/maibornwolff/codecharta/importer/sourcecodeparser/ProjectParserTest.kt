package de.maibornwolff.codecharta.importer.sourcecodeparser

import org.junit.Assert.assertThat
import org.junit.Test
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.IOException
import java.io.PrintStream
import java.nio.file.Files

class ProjectParserTest{

    @Test
    fun scan_Project(){
        val projectParser = ProjectParser()
        projectParser.scanProject(File("").absoluteFile, null)
    }
}