package de.maibornwolff.codecharta.importer.sourcecodeparser.visitors

import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import org.sonar.api.batch.fs.InputFile
import org.sonar.api.batch.fs.internal.TestInputFileBuilder
import org.sonar.java.model.DefaultJavaFileScannerContext
import org.sonar.java.model.JParser
import org.sonar.java.model.JavaVersionImpl
import org.sonar.plugins.java.Java
import org.sonar.plugins.java.api.tree.Tree
import java.io.File
import java.nio.charset.StandardCharsets
import java.nio.file.Files
import java.util.Collections

class MaxNestingLevelVisitorTest {
    private val baseDir = File("src/test/resources/max-nesting-level").absoluteFile

    private fun getTree(fileName: String): Tree {
        val file = File("$baseDir/$fileName")
        val inputFile: InputFile = TestInputFileBuilder.create("moduleKey", fileName)
            .setModuleBaseDir(baseDir.toPath())
            .setCharset(StandardCharsets.UTF_8)
            .setType(InputFile.Type.MAIN)
            .setLanguage(Java.KEY)
            .initMetadata(String(Files.readAllBytes(File("$baseDir/$fileName").toPath()), StandardCharsets.UTF_8))
            .build()

        val compilationUnitTree = JParser.parse(JParser.MAXIMUM_SUPPORTED_JAVA_VERSION, inputFile.filename(), inputFile.contents(), Collections.singletonList(file))
        val defaultJavaFileScannerContext = DefaultJavaFileScannerContext(
            compilationUnitTree,
            inputFile,
            null,
            null,
            JavaVersionImpl(),
            true
        )

        return defaultJavaFileScannerContext.tree
    }


    @Test
    fun getMaxNestingLevelOfNestedIfs() {
        val maxNestingLevel = MaxNestingLevelVisitor().getMaxNestingLevel(getTree("nested_ifs.java"))

        Assertions.assertThat(maxNestingLevel).isEqualTo(2)
    }

    @Test
    fun getMaxNestingLevelOfIfElse() {
        val maxNestingLevel = MaxNestingLevelVisitor().getMaxNestingLevel(getTree("if_else.java"))

        Assertions.assertThat(maxNestingLevel).isEqualTo(1)
    }

    @Test
    fun getMaxNestingLevelOfGoldenTest() {
        val maxNestingLevel = MaxNestingLevelVisitor().getMaxNestingLevel(getTree("golden_test.java"))

        Assertions.assertThat(maxNestingLevel).isEqualTo(7)
    }

    @Test
    fun getMaxNestingLevelOfLambdaFunctions() {
        val maxNestingLevel = MaxNestingLevelVisitor().getMaxNestingLevel(getTree("lambda_function.java"))

        Assertions.assertThat(maxNestingLevel).isEqualTo(2)
    }
}
