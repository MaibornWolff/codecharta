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
import java.io.File
import java.nio.charset.StandardCharsets
import java.nio.file.Files

internal class MaxNestingLevelVisitorTest {
    private val baseDir = File("src/test/resources/sampleproject").absoluteFile

    @Test
    fun getMaxNestingLevel() {
        val file = File("src/test/resources/sampleproject/foo.java")
        val inputFile: InputFile = TestInputFileBuilder.create("moduleKey", "foo.java")
                .setModuleBaseDir(baseDir.toPath())
                .setCharset(StandardCharsets.UTF_8)
                .setType(InputFile.Type.MAIN)
                .setLanguage(Java.KEY)
                .initMetadata(String(Files.readAllBytes(File("$baseDir/foo.java").toPath()), StandardCharsets.UTF_8))
                .build()

        val compilationUnitTree = JavaParser.createParser().parse(file) as CompilationUnitTree
        val defaultJavaFileScannerContext = DefaultJavaFileScannerContext(
                compilationUnitTree, inputFile, null, null, JavaVersionImpl(), true)

        val maxNestingLevel = MaxNestingLevelVisitor().getMaxNestingLevel(defaultJavaFileScannerContext.tree)

        assertEquals(maxNestingLevel, 1)
    }
}
