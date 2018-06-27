package de.maibornwolff.codecharta.importer.ooparser.antlr

import de.maibornwolff.codecharta.importer.ooparser.antlr.java.JavaParser
import de.maibornwolff.codecharta.importer.ooparser.antlr.java.JavaLexer
import org.antlr.v4.runtime.CharStreams
import org.antlr.v4.runtime.CommonTokenStream
import java.io.IOException
import java.io.File
import java.nio.file.Files.readAllBytes
import java.io.ByteArrayInputStream
import java.io.InputStream


@Throws(IOException::class)
fun createParserForFile(filePath: String): JavaParser {
    return createParser(ByteArrayInputStream(readAllBytes(File(filePath).toPath())))
}

@Throws(IOException::class)
private fun createParser(code: InputStream): JavaParser {

    val lexer = JavaLexer(CharStreams.fromStream(code))
    val tokens = CommonTokenStream(lexer)

    return JavaParser(tokens)
}