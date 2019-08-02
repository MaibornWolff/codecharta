package de.maibornwolff.codecharta.importer.sourcecodeparser.visitors

import junit.framework.Assert.assertEquals
import org.junit.jupiter.api.Test
import org.sonar.api.batch.fs.InputFile
import org.sonar.api.batch.fs.internal.TestInputFileBuilder

import org.sonar.java.ast.parser.JavaParser
import org.sonar.java.model.DefaultJavaFileScannerContext
import org.sonar.java.model.JavaVersionImpl
import org.sonar.plugins.java.Java
import org.sonar.plugins.java.api.tree.CompilationUnitTree
import org.sonar.plugins.java.api.tree.Tree
import java.io.File
import java.nio.charset.StandardCharsets
import java.nio.file.Files

class MaxNestingLevelVisitorTest {
    private val baseDir = File("src/test/resources/max-nesting-level").absoluteFile

    private fun getTree(fileName: String) : Tree {
        val file = File("$baseDir/$fileName")
        val inputFile: InputFile = TestInputFileBuilder.create("moduleKey", fileName)
                .setModuleBaseDir(baseDir.toPath())
                .setCharset(StandardCharsets.UTF_8)
                .setType(InputFile.Type.MAIN)
                .setLanguage(Java.KEY)
                .initMetadata(String(Files.readAllBytes(File("$baseDir/$fileName").toPath()), StandardCharsets.UTF_8))
                .build()

        val compilationUnitTree = JavaParser.createParser().parse(file) as CompilationUnitTree
        val defaultJavaFileScannerContext = DefaultJavaFileScannerContext(
                compilationUnitTree, inputFile, null, null, JavaVersionImpl(), true)

        return defaultJavaFileScannerContext.tree
    }

    @Test
    fun getMaxNestingLevelOfNestedIfs() {
        val maxNestingLevel = MaxNestingLevelVisitor().getMaxNestingLevel(getTree("nested_ifs.java"))

        assertEquals(2, maxNestingLevel)
    }

    @Test
    fun getMaxNestingLevelOfIfElse() {
        val maxNestingLevel = MaxNestingLevelVisitor().getMaxNestingLevel(getTree("if_else.java"))

        assertEquals(1, maxNestingLevel)
    }

    @Test
    fun getMaxNestingLevelOfGoldenTest() {
        val maxNestingLevel = MaxNestingLevelVisitor().getMaxNestingLevel(getTree("golden_test.java"))

        assertEquals(7, maxNestingLevel)
    }

    @Test
    fun getMaxNestingLevelOfLambdaFunctions() {
        val maxNestingLevel = MaxNestingLevelVisitor().getMaxNestingLevel(getTree("lambda_function.java"))

        assertEquals(2, maxNestingLevel)
    }
}
