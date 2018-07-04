package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.core.intermediate

import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.intermediateBaseFolder
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.infrastructure.antlr.java.Antlr
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.core.antlrinterop.CodeTags
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.core.antlrinterop.NonCodeTags
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import java.io.IOException
import java.nio.file.Files
import java.nio.file.Paths

class SourceCodeComplexInterfaceTest {

    @Test
    @Throws(IOException::class)
    fun finds_all_lines() {
        val resource = "$intermediateBaseFolder/java/SourceCodeComplexInterface.java"
        val sourceCode = SourceCode(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))

        Antlr.addTagsToSource(sourceCode)

        assertThat(sourceCode.lineCount()).isEqualTo(66)
    }

    @Test
    @Throws(IOException::class)
    fun finds_all_comments() {
        val resource = "$intermediateBaseFolder/java/SourceCodeComplexInterface.java"
        val sourceCode = SourceCode(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))

        Antlr.addTagsToSource(sourceCode)

        assertThat(sourceCode.linesWithTag(NonCodeTags.COMMENT)).containsExactly(8, 9, 10, 11, 16, 19, 39, 48, 59)
    }

    @Test
    @Throws(IOException::class)
    fun finds_imports() {
        val resource = "$intermediateBaseFolder/java/SourceCodeComplexInterface.java"
        val sourceCode = SourceCode(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))

        Antlr.addTagsToSource(sourceCode)

        assertThat(sourceCode.linesWithTag(CodeTags.IMPORT)).containsExactly(4, 6)
    }

    @Test
    @Throws(IOException::class)
    fun finds_interface() {
        val resource = "$intermediateBaseFolder/java/SourceCodeComplexInterface.java"
        val sourceCode = SourceCode(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))

        Antlr.addTagsToSource(sourceCode)

        assertThat(sourceCode.linesWithTag(CodeTags.INTERFACE)).containsExactly(13)
    }

    @Test
    @Throws(IOException::class)
    fun finds_constant_declarations() {
        val resource = "$intermediateBaseFolder/java/SourceCodeComplexInterface.java"
        val sourceCode = SourceCode(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))

        Antlr.addTagsToSource(sourceCode)

        assertThat(sourceCode.linesWithTag(CodeTags.INTERFACE_CONSTANT)).containsExactly(17)
    }

    @Test
    @Throws(IOException::class)
    fun finds_enumConstant() {
        val resource = "$intermediateBaseFolder/java/SourceCodeComplexInterface.java"
        val sourceCode = SourceCode(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))

        Antlr.addTagsToSource(sourceCode)

        assertThat(sourceCode.linesWithTag(CodeTags.ENUM_CONSTANT)).containsExactly(21, 22, 23, 24)
    }

    @Test
    @Throws(IOException::class)
    fun finds_fields_in_enum() {
        val resource = "$intermediateBaseFolder/java/SourceCodeComplexInterface.java"
        val sourceCode = SourceCode(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))

        Antlr.addTagsToSource(sourceCode)

        assertThat(sourceCode.linesWithTag(CodeTags.CLASS_FIELD)).containsExactly(26, 27)
    }

    @Test
    @Throws(IOException::class)
    fun finds_methods() {
        val resource = "$intermediateBaseFolder/java/SourceCodeComplexInterface.java"
        val sourceCode = SourceCode(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))

        Antlr.addTagsToSource(sourceCode)

        assertThat(sourceCode.linesWithTag(CodeTags.METHOD)).containsExactly(34, 36, 40, 44, 49, 60)
    }

    @Test
    @Throws(IOException::class)
    fun finds_constructor() {
        val resource = "$intermediateBaseFolder/java/SourceCodeComplexInterface.java"
        val sourceCode = SourceCode(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))

        Antlr.addTagsToSource(sourceCode)

        assertThat(sourceCode.linesWithTag(CodeTags.CONSTRUCTOR)).containsExactly(29)
    }

    @Test
    @Throws(IOException::class)
    fun finds_method_calls() {
        val resource = "$intermediateBaseFolder/java/SourceCodeComplexInterface.java"
        val sourceCode = SourceCode(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))

        Antlr.addTagsToSource(sourceCode)

        assertThat(sourceCode.linesWithTag(CodeTags.METHOD_CALL)).containsExactly(51, 53, 55, 61, 62, 63, 64)
    }

    @Test
    @Throws(IOException::class)
    fun finds_statements() {
        val resource = "$intermediateBaseFolder/java/SourceCodeComplexInterface.java"
        val sourceCode = SourceCode(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))

        Antlr.addTagsToSource(sourceCode)

        assertThat(sourceCode.linesWithTag(CodeTags.STATEMENT))
                .containsExactly(30, 31, 34, 36, 50, 51, 53, 55, 61)
    }

    @Test
    @Throws(IOException::class)
    fun finds_expressions() {
        val resource = "$intermediateBaseFolder/java/SourceCodeComplexInterface.java"
        val sourceCode = SourceCode(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))

        Antlr.addTagsToSource(sourceCode)

        assertThat(sourceCode.linesWithTag(CodeTags.EXPRESSION))
                .containsExactly(17, 21, 22, 23, 24, 30, 31, 34, 36, 51, 53, 54, 55, 61, 62, 64)
    }

}