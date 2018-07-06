package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.tagging

import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.intermediateBaseFolder
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.infrastructure.antlr.java.Antlr
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import java.io.IOException
import java.nio.file.Files
import java.nio.file.Paths

class SourceCodeSimpleClassTest {

    @Test(expected = IndexOutOfBoundsException::class)
    @Throws(IOException::class)
    fun trying_index_0_results_in_exceptions_because_code_starts_at_line_1() {
        val resource = "$intermediateBaseFolder/java/SourceCodeSimple.java"
        val sourceCode = SourceFile(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))

        Antlr.addTagsToSource(sourceCode)

        sourceCode[0]
    }

    @Test
    @Throws(IOException::class)
    fun trying_last_index_does_not_result_in_exception() {
        val resource = "$intermediateBaseFolder/java/SourceCodeSimple.java"
        val sourceCode = SourceFile(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))

        Antlr.addTagsToSource(sourceCode)

        sourceCode[sourceCode.lineCount()]
    }

    @Test
    @Throws(IOException::class)
    fun finds_all_lines() {
        val resource = "$intermediateBaseFolder/java/SourceCodeSimple.java"
        val sourceCode = SourceFile(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))

        Antlr.addTagsToSource(sourceCode)

        assertThat(sourceCode.lineCount()).isEqualTo(43)
    }

    @Test
    @Throws(IOException::class)
    fun finds_all_comments() {
        val resource = "$intermediateBaseFolder/java/SourceCodeSimple.java"
        val sourceCode = SourceFile(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))

        Antlr.addTagsToSource(sourceCode)

        assertThat(sourceCode.linesWithTag(NonCodeTags.COMMENT)).containsExactly(6, 7, 8, 17, 19)
    }

    @Test
    @Throws(IOException::class)
    fun finds_package_declaration() {
        val resource = "$intermediateBaseFolder/java/SourceCodeSimple.java"
        val sourceCode = SourceFile(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))

        Antlr.addTagsToSource(sourceCode)

        assertThat(sourceCode.linesWithTag(CodeTags.PACKAGE)).containsExactly(1)
    }

    @Test
    @Throws(IOException::class)
    fun empty_line_is_not_code() {
        val resource = "$intermediateBaseFolder/java/SourceCodeSimple.java"
        val sourceCode = SourceFile(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))

        Antlr.addTagsToSource(sourceCode)

        assertThat(sourceCode[2].tags()).isEmpty()
    }

    @Test
    @Throws(IOException::class)
    fun finds_import_statements() {
        val resource = "$intermediateBaseFolder/java/SourceCodeSimple.java"
        val sourceCode = SourceFile(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))

        Antlr.addTagsToSource(sourceCode)

        assertThat(sourceCode.linesWithTag(CodeTags.IMPORT)).containsExactly(3, 4)
    }

    @Test
    @Throws(IOException::class)
    fun finds_annotations() {
        val resource = "$intermediateBaseFolder/java/SourceCodeSimple.java"
        val sourceCode = SourceFile(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))

        Antlr.addTagsToSource(sourceCode)

        assertThat(sourceCode.linesWithTag(CodeTags.ANNOTATION_INVOCATION)).containsExactly(9, 12)
    }

    @Test
    @Throws(IOException::class)
    fun finds_class() {
        val resource = "$intermediateBaseFolder/java/SourceCodeSimple.java"
        val sourceCode = SourceFile(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))

        Antlr.addTagsToSource(sourceCode)

        assertThat(sourceCode.linesWithTag(CodeTags.CLASS)).containsExactly(10)
    }

    @Test
    @Throws(IOException::class)
    fun finds_field_declarations() {
        val resource = "$intermediateBaseFolder/java/SourceCodeSimple.java"
        val sourceCode = SourceFile(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))

        Antlr.addTagsToSource(sourceCode)

        assertThat(sourceCode.linesWithTag(CodeTags.CLASS_FIELD)).containsExactly(13, 15)
    }

    @Test
    @Throws(IOException::class)
    fun finds_constructor_declarations() {
        val resource = "$intermediateBaseFolder/java/SourceCodeSimple.java"
        val sourceCode = SourceFile(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))

        Antlr.addTagsToSource(sourceCode)

        assertThat(sourceCode.linesWithTag(CodeTags.CONSTRUCTOR)).containsExactly(18)
    }

    @Test
    @Throws(IOException::class)
    fun finds_method_declarations() {
        val resource = "$intermediateBaseFolder/java/SourceCodeSimple.java"
        val sourceCode = SourceFile(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))

        Antlr.addTagsToSource(sourceCode)

        assertThat(sourceCode.linesWithTag(CodeTags.METHOD)).containsExactly(22, 29, 40)
    }

    @Test
    @Throws(IOException::class)
    fun finds_global_and_local_variables() {
        val resource = "$intermediateBaseFolder/java/SourceCodeSimple.java"
        val sourceCode = SourceFile(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))

        Antlr.addTagsToSource(sourceCode)

        assertThat(sourceCode.linesWithTag(CodeTags.VARIABLE)).containsExactly(13, 15, 23)
    }

    @Test
    @Throws(IOException::class)
    fun finds_expressions_inside_class() {
        val resource = "$intermediateBaseFolder/java/SourceCodeSimple.java"
        val sourceCode = SourceFile(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))

        Antlr.addTagsToSource(sourceCode)

        assertThat(sourceCode.linesWithTag(CodeTags.EXPRESSION))
                .containsExactly(12, 15, 19, 23, 24, 25, 26, 30, 31, 32, 33, 34, 35, 37, 41)
    }

    @Test
    @Throws(IOException::class)
    fun finds_statements_inside_methods() {
        val resource = "$intermediateBaseFolder/java/SourceCodeSimple.java"
        val sourceCode = SourceFile(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))

        Antlr.addTagsToSource(sourceCode)

        assertThat(sourceCode.linesWithTag(CodeTags.STATEMENT))
                .containsExactly(19, 24, 25, 26, 30, 31, 32, 33, 34, 35, 37, 41)
    }

    @Test
    @Throws(IOException::class)
    fun finds_method_calls() {
        val resource = "$intermediateBaseFolder/java/SourceCodeSimple.java"
        val sourceCode = SourceFile(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))

        Antlr.addTagsToSource(sourceCode)

        assertThat(sourceCode.linesWithTag(CodeTags.METHOD_CALL)).containsExactly(32, 34, 37)
    }

    @Test
    @Throws(IOException::class)
    fun finds_conditions() {
        val resource = "$intermediateBaseFolder/java/SourceCodeSimple.java"
        val sourceCode = SourceFile(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))

        Antlr.addTagsToSource(sourceCode)

        assertThat(sourceCode.linesWithTag(CodeTags.CONDITION)).containsExactly(31, 34)
    }

}