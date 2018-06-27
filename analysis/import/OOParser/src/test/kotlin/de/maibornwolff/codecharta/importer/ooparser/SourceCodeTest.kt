package de.maibornwolff.codecharta.importer.ooparser

import de.maibornwolff.codecharta.importer.ooparser.antlr.java.Api
import de.maibornwolff.codecharta.importer.ooparser.antlr.java.ExtendedBaseVisitor
import de.maibornwolff.codecharta.importer.ooparser.antlr.createParserForFile
import de.maibornwolff.codecharta.importer.ooparser.antlrinterop.CodeTags
import de.maibornwolff.codecharta.importer.ooparser.antlrinterop.NonCodeTags
import de.maibornwolff.codecharta.importer.ooparser.intermediate.SourceCode
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import java.io.IOException
import java.nio.file.Files
import java.nio.file.Paths

class SourceCodeTest {

    @Test
    @Throws(IOException::class)
    fun finds_all_lines() {
        val resource = "de/maibornwolff/codecharta/importer/ooparser/SourceCodeSimple.java"
        val sourceCode = SourceCode(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))

        Api.addTagsToSource(sourceCode)

        assertThat(sourceCode.linesOfCode()).isEqualTo(43)
    }

    @Test
    @Throws(IOException::class)
    fun finds_all_comments() {
        val resource = "de/maibornwolff/codecharta/importer/ooparser/SourceCodeSimple.java"
        val sourceCode = SourceCode(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))

        Api.addTagsToSource(sourceCode)

        assertThat(sourceCode.linesWithTag(NonCodeTags.COMMENT)).containsExactly(6, 7, 8, 17, 19)
    }

    @Test
    @Throws(IOException::class)
    fun finds_package_declaration() {
        val resource = "de/maibornwolff/codecharta/importer/ooparser/SourceCodeSimple.java"
        val sourceCode = SourceCode(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))
        val parser = createParserForFile(javaClass.classLoader.getResource(resource)!!.file)
        val visitor = ExtendedBaseVisitor(sourceCode)

        visitor.visit(parser.compilationUnit())

        assertThat(sourceCode.linesWithTag(CodeTags.PACKAGE)).containsExactly(1)
    }

    @Test
    @Throws(IOException::class)
    fun empty_line_is_not_code() {
        val resource = "de/maibornwolff/codecharta/importer/ooparser/SourceCodeSimple.java"
        val sourceCode = SourceCode(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))
        val parser = createParserForFile(javaClass.classLoader.getResource(resource)!!.file)
        val visitor = ExtendedBaseVisitor(sourceCode)

        visitor.visit(parser.compilationUnit())

        assertThat(sourceCode[2].tags()).isEmpty()
    }

    @Test
    @Throws(IOException::class)
    fun finds_import_statements() {
        val resource = "de/maibornwolff/codecharta/importer/ooparser/SourceCodeSimple.java"
        val sourceCode = SourceCode(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))
        val parser = createParserForFile(javaClass.classLoader.getResource(resource)!!.file)
        val visitor = ExtendedBaseVisitor(sourceCode)

        visitor.visit(parser.compilationUnit())

        assertThat(sourceCode.linesWithTag(CodeTags.IMPORT)).containsExactly(3, 4)
    }

    @Test
    @Throws(IOException::class)
    fun finds_annotations() {
        val resource = "de/maibornwolff/codecharta/importer/ooparser/SourceCodeSimple.java"
        val sourceCode = SourceCode(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))
        val parser = createParserForFile(javaClass.classLoader.getResource(resource)!!.file)
        val visitor = ExtendedBaseVisitor(sourceCode)

        visitor.visit(parser.compilationUnit())

        assertThat(sourceCode.linesWithTag(CodeTags.ANNOTATION)).containsExactly(9, 12)
    }

    @Test
    @Throws(IOException::class)
    fun finds_field_declarations() {
        val resource = "de/maibornwolff/codecharta/importer/ooparser/SourceCodeSimple.java"
        val sourceCode = SourceCode(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))
        val parser = createParserForFile(javaClass.classLoader.getResource(resource)!!.file)
        val visitor = ExtendedBaseVisitor(sourceCode)

        visitor.visit(parser.compilationUnit())

        assertThat(sourceCode.linesWithTag(CodeTags.FIELD)).containsExactly(13, 15)
    }

    @Test
    @Throws(IOException::class)
    fun finds_constructor_declarations() {
        val resource = "de/maibornwolff/codecharta/importer/ooparser/SourceCodeSimple.java"
        val sourceCode = SourceCode(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))
        val parser = createParserForFile(javaClass.classLoader.getResource(resource)!!.file)
        val visitor = ExtendedBaseVisitor(sourceCode)

        visitor.visit(parser.compilationUnit())

        assertThat(sourceCode.linesWithTag(CodeTags.CONSTRUCTOR)).containsExactly(18)
    }

    @Test
    @Throws(IOException::class)
    fun finds_method_declarations() {
        val resource = "de/maibornwolff/codecharta/importer/ooparser/SourceCodeSimple.java"
        val sourceCode = SourceCode(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))
        val parser = createParserForFile(javaClass.classLoader.getResource(resource)!!.file)
        val visitor = ExtendedBaseVisitor(sourceCode)

        visitor.visit(parser.compilationUnit())

        assertThat(sourceCode.linesWithTag(CodeTags.METHOD)).containsExactly(22, 29, 40)
    }

    @Test
    @Throws(IOException::class)
    fun finds_global_and_local_variables() {
        val resource = "de/maibornwolff/codecharta/importer/ooparser/SourceCodeSimple.java"
        val sourceCode = SourceCode(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))
        val parser = createParserForFile(javaClass.classLoader.getResource(resource)!!.file)
        val visitor = ExtendedBaseVisitor(sourceCode)

        visitor.visit(parser.compilationUnit())

        assertThat(sourceCode.linesWithTag(CodeTags.VARIABLE)).containsExactly(13, 15, 23)
    }

    @Test
    @Throws(IOException::class)
    fun finds_expressions_inside_class() {
        val resource = "de/maibornwolff/codecharta/importer/ooparser/SourceCodeSimple.java"
        val sourceCode = SourceCode(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))
        val parser = createParserForFile(javaClass.classLoader.getResource(resource)!!.file)
        val visitor = ExtendedBaseVisitor(sourceCode)

        visitor.visit(parser.compilationUnit())

        assertThat(sourceCode.linesWithTag(CodeTags.EXPRESSION))
                .containsExactly(12, 15, 19, 23, 24, 25, 26, 30, 31, 32, 33, 34, 35, 37, 41)
    }

    @Test
    @Throws(IOException::class)
    fun finds_statements_inside_methods() {
        val resource = "de/maibornwolff/codecharta/importer/ooparser/SourceCodeSimple.java"
        val sourceCode = SourceCode(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))
        val parser = createParserForFile(javaClass.classLoader.getResource(resource)!!.file)
        val visitor = ExtendedBaseVisitor(sourceCode)

        visitor.visit(parser.compilationUnit())

        assertThat(sourceCode.linesWithTag(CodeTags.STATEMENT))
                .containsExactly(19, 24, 25, 26, 30, 31, 32, 33, 34, 35, 37, 41)
    }

    @Test
    @Throws(IOException::class)
    fun finds_method_calls() {
        val resource = "de/maibornwolff/codecharta/importer/ooparser/SourceCodeSimple.java"
        val sourceCode = SourceCode(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))
        val parser = createParserForFile(javaClass.classLoader.getResource(resource)!!.file)
        val visitor = ExtendedBaseVisitor(sourceCode)

        visitor.visit(parser.compilationUnit())

        assertThat(sourceCode.linesWithTag(CodeTags.METHOD_CALL)).containsExactly(32, 34, 37)
    }

    @Test
    @Throws(IOException::class)
    fun finds_conditions() {
        val resource = "de/maibornwolff/codecharta/importer/ooparser/SourceCodeSimple.java"
        val sourceCode = SourceCode(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))
        val parser = createParserForFile(javaClass.classLoader.getResource(resource)!!.file)
        val visitor = ExtendedBaseVisitor(sourceCode)

        visitor.visit(parser.compilationUnit())

        assertThat(sourceCode.linesWithTag(CodeTags.CONDITION)).containsExactly(31, 34)
    }

}