package de.maibornwolff.codecharta.analysers.filters.mergefilter

import com.varabyte.kotter.runtime.Session
import com.varabyte.kotterx.test.foundation.testSession
import de.maibornwolff.codecharta.analysers.analyserinterface.runInTerminalSession
import de.maibornwolff.codecharta.analysers.filters.mergefilter.MergeFilter.Companion.main
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import io.mockk.every
import io.mockk.mockkObject
import io.mockk.mockkStatic
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import picocli.CommandLine
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.PrintStream

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class MergeFilterTest {
    val outContent = ByteArrayOutputStream()
    val errContent = ByteArrayOutputStream()

    @BeforeAll
    fun beforeAllTests() {
        System.setOut(PrintStream(outContent))
        System.setErr(PrintStream(errContent))
    }

    @BeforeEach
    fun beforeTest() {
        mockRunInTerminalSession()
    }

    @AfterEach
    fun unmockEverything() {
        outContent.reset()
        errContent.reset()
        unmockkAll()
    }

    @AfterAll
    fun afterAllTests() {
        System.setOut(System.out)
        System.setErr(System.err)
    }

    @Test
    fun `should merge all files in a folder correctly`() {
        val projectLocation = "src/test/resources/mergeFolderTest"
        val invalidFile = "invalid.json"

        CommandLine(MergeFilter()).execute(projectLocation).toString()

        // should ignore files starting with a dot
        assertThat(outContent.toString()).doesNotContain("ShouldNotAppear.java")

        // should warn about skipped files
        assertThat(errContent.toString()).contains(invalidFile)
    }

    @Test
    fun `should merge all indicated files`() {
        CommandLine(MergeFilter()).execute(
            "src/test/resources/mergeFolderTest/file1.cc.json",
            "src/test/resources/mergeFolderTest/file2.cc.json"
        ).toString()

        val valueInFile1 = "SourceMonCsvConverterTest.java"
        val valueInFile2 = "SourceMonCsvConverter.java"

        assertThat(outContent.toString()).contains(valueInFile1)
        assertThat(outContent.toString()).contains(valueInFile2)
    }

    @Test
    fun `should create json uncompressed file`() {
        val inputFile1 = "src/test/resources/test.json"
        val inputFile2 = "src/test/resources/test2.json"

        main(
            arrayOf(
                inputFile1,
                inputFile2,
                "-nc",
                "-o=src/test/resources/output"
            )
        )
        val file = File("src/test/resources/output.cc.json")
        file.deleteOnExit()

        assertThat(file.exists()).isTrue
    }

    @Test
    fun `should merge non-overlapping json files with force`() {
        CommandLine(MergeFilter()).execute(
            "src/test/resources/mergeFolderNoOverlap/file1_no_overlap.cc.json",
            "src/test/resources/mergeFolderNoOverlap/file2_no_overlap.cc.json",
            "-f"
        ).toString()

        val valueInFile1 = "JavaParserTest.java"
        val valueInFile2 = "JavaParser.java"

        assertThat(outContent.toString()).contains(valueInFile1)
        assertThat(outContent.toString()).contains(valueInFile2)
    }

    @Test
    fun `should create json gzip file`() {
        main(
            arrayOf(
                "src/test/resources/test.json",
                "src/test/resources/test2.json",
                "-o=src/test/resources/output"
            )
        )
        val file = File("src/test/resources/output.cc.json.gz")
        file.deleteOnExit()

        assertThat(file.exists()).isTrue
    }

    @Test
    fun `should not execute merge if input is invalid`() {
        CommandLine(MergeFilter()).execute(
            "src/test/resources/mergeFolderTest/file1.cc.json",
            "src/test/resources/thisDoesNotExist.cc.json"
        ).toString()

        assertThat(errContent.toString()).contains("thisDoesNotExist.cc.json")
        assertThat(errContent.toString()).contains("Input invalid files/folders for MergeFilter, stopping execution")
    }

    @Test
    fun `should warn if no top-level overlap and ask user to force merge`() {
        mockkObject(Dialog)
        every { Dialog.askForceMerge(any()) } returns true

        CommandLine(MergeFilter()).execute(
            "src/test/resources/mergeFolderNoOverlap/file1_no_overlap.cc.json",
            "src/test/resources/mergeFolderNoOverlap/file2_no_overlap.cc.json"
        ).toString()

        assertThat(errContent.toString()).contains("Warning: No top-level overlap between projects")

        val valueInFile1 = "JavaParserTest.java"
        val valueInFile2 = "JavaParser.java"
        assertThat(outContent.toString()).contains(valueInFile1)
        assertThat(outContent.toString()).contains(valueInFile2)
    }

    @Test
    fun `should cancel merge if no top-level overlap and user declines force merge`() {
        mockkObject(Dialog)
        every {
            Dialog.askForceMerge(any())
        } returns false

        CommandLine(MergeFilter()).execute(
            "src/test/resources/mergeFolderNoOverlap/file1_no_overlap.cc.json",
            "src/test/resources/mergeFolderNoOverlap/file2_no_overlap.cc.json"
        ).toString()

        assertThat(errContent.toString()).contains("Warning: No top-level overlap between projects")

        assertThat(outContent.toString()).doesNotContain("SourceMonCsvConverter.java")
    }

    @Test
    fun `should return Dialog when getDialog is called`() {
        val mergeFilter = MergeFilter()

        assertThat(mergeFilter.getDialog()).isSameAs(Dialog)
    }

    @Test
    fun `should return false for isApplicable`() {
        val mergeFilter = MergeFilter()

        assertThat(mergeFilter.isApplicable("resourceToBeParsed")).isFalse
    }

    @Test
    fun `should log error when folder path is invalid`() {
        CommandLine(MergeFilter()).execute("invalid/folder/path").toString()

        assertThat(errContent.toString()).contains("Input invalid files/folders for MergeFilter, stopping execution...")
    }

    @Test
    fun `should log error when no cc json files found in folder`() {
        val emptyFolder = File("src/test/resources/emptyFolder")
        emptyFolder.mkdirs()
        emptyFolder.deleteOnExit()

        CommandLine(MergeFilter()).execute(emptyFolder.absolutePath).toString()

        assertThat(errContent.toString()).contains("Input invalid files/folders for MergeFilter, stopping execution...")
    }

    @Test
    fun `should throw exception when both merging strategies are set`() {
        CommandLine(MergeFilter()).execute(
            "src/test/resources/test.json",
            "src/test/resources/test2.json",
            "--leaf=false",
            "--recursive=false"
        )

        assertThat(errContent.toString()).contains("At least one merging strategy must be set")
    }

    @Nested
    @DisplayName("MimoModeTests")
    inner class MimoModeTest {
        private val testFile1Path = "src/test/resources/test.json"
        val testProjectPathA = "src/test/resources/mimoFileSelection/testProject.alpha.cc.json"
        val testProjectPathB = "src/test/resources/mimoFileSelection/testProject.beta.cc.json"
        val testProjectPathC = "src/test/resources/mimoFileSelection/testProjectX.notIncl.cc.json"
        val invalidTestProjectPath = "src/test/resources/testProject.invalid.cc.json"
        val testProjectFolder = "src/test/resources/mimoFileSelection"

        val testNoOverlapPath1 = "src/test/resources/mimoOverlap/prefix.file1_no_overlap.cc.json"
        val testNoOverlapPath2 = "src/test/resources/mimoOverlap/prefix.file2_no_overlap.cc.json"

        @Test
        fun `should warn about invalid files during mimo merge and abort`() {
            CommandLine(MergeFilter()).execute(
                "src/test/resources/invalid.cc.json",
                "--mimo"
            ).toString()

            assertThat(errContent.toString()).contains("Input invalid files/folders for MergeFilter, stopping execution...")
        }

        @Test
        fun `should handle single file gracefully in mimo mode`() {
            CommandLine(MergeFilter()).execute(
                testFile1Path,
                "--mimo"
            ).toString()

            assertThat(errContent.toString()).contains("Discarded 'test' of test.json as a potential group")
        }

        @Nested
        @DisplayName("FileSelection")
        inner class MimoFileSelection {
            @Test
            fun `should merge two selected files if two of three are selected`() {
                val testFile1 = File(testProjectPathA)
                val testFile2 = File(testProjectPathB)

                mockkObject(Dialog)
                every { Dialog.requestMimoFileSelection(any(), any()) } returns listOf(testFile1, testFile2)

                CommandLine(MergeFilter()).execute(
                    testProjectFolder,
                    "--mimo",
                    "-nc"
                ).toString()

                val outputFileName = "testProject.merge.cc.json"
                val outputFile = File(outputFileName)
                val outputBufferedReader = outputFile.bufferedReader()
                val outputFileContent = outputBufferedReader.readText()

                assertThat(errContent.toString()).contains("Merged files with prefix 'testProject' into '$outputFileName'")
                assertThat(outputFileContent).doesNotContain("ThirdTestAttribute")
                assertThat(outputFileContent).contains("Lines*")
                assertThat(outputFileContent).contains("AdditionalAttributeForTest")

                outputBufferedReader.close()
                outputFile.deleteOnExit()
            }

            @Test
            fun `should stop execution if only one file is selected`() {
                val testFile1 = File(testProjectPathA)

                mockkObject(Dialog)
                every { Dialog.requestMimoFileSelection(any(), any()) } returns listOf(testFile1)

                CommandLine(MergeFilter()).execute(
                    testProjectFolder,
                    "--mimo",
                    "-nc"
                ).toString()

                assertThat(errContent.toString()).contains("Continue with next group, because one or less files were selected")
            }

            @Test
            fun `should warn if only one file valid after deserializing`() {
                val invalidTestFile = File(invalidTestProjectPath)

                CommandLine(MergeFilter()).execute(
                    testProjectPathA,
                    invalidTestProjectPath,
                    "--mimo",
                    "-nc"
                ).toString()

                assertThat(errContent.toString()).contains(
                    "${invalidTestFile.name} is not a valid project file and will be skipped"
                )
                assertThat(errContent.toString()).contains(
                    "After deserializing there were one or less projects. Continue with next group"
                )
            }

            @Test
            fun `should merge two input files without name or file or overlap question`() {
                CommandLine(MergeFilter()).execute(
                    testProjectPathA,
                    testProjectPathB,
                    "--mimo",
                    "-nc"
                )

                val outputFileName = "testProject.merge.cc.json"
                val outputFile = File(outputFileName)
                val outputBufferedReader = outputFile.bufferedReader()
                val outputFileContent = outputBufferedReader.readText()

                assertThat(errContent.toString()).contains("Merged files with prefix 'testProject' into '$outputFileName'")
                assertThat(outputFileContent).contains("Lines*")
                assertThat(outputFileContent).contains("AdditionalAttributeForTest")

                outputBufferedReader.close()
                outputFile.deleteOnExit()
            }
        }

        @Test
        fun `should warn if no top-level overlap for mimo merged files and skip merge`() {
            mockkObject(Dialog)
            every { Dialog.askForceMerge(any()) } returns false

            CommandLine(MergeFilter()).execute(
                testNoOverlapPath1,
                testNoOverlapPath2,
                "--mimo"
            )

            assertThat(errContent.toString()).contains("No top-level overlap between projects. Missing first-level nodes")
        }

        @Test
        fun `should not warn if no top-level overlap for mimo and merge`() {
            mockkObject(Dialog)
            every { Dialog.askForceMerge(any()) } returns false

            CommandLine(MergeFilter()).execute(
                testNoOverlapPath1,
                testNoOverlapPath2,
                "--mimo",
                "-f",
                "-nc"
            )

            val outputFileName = "prefix.merge.cc.json"
            val outputFile = File(outputFileName)
            val outputBufferedReader = outputFile.bufferedReader()
            val outputFileContent = outputBufferedReader.readText()

            assertThat(errContent.toString()).contains("Merged files with prefix 'prefix' into '$outputFileName'")
            assertThat(outputFileContent).contains("JavaParser.java")
            assertThat(outputFileContent).contains("JavaParserTest.java")
            assertThat(outputFile).exists()

            outputBufferedReader.close()
            outputFile.deleteOnExit()
        }

        @Nested
        @DisplayName("Output File Name")
        inner class MimoOutputName {
            @Test
            fun `should ask about output file name`() {
                val testFile1 = File(testProjectPathA)
                val testFile2 = File(testProjectPathB)
                val testFile3 = File(testProjectPathC)
                val prefixTestFile3 = "testProjectX"

                mockkObject(Dialog)
                every { Dialog.askForMimoPrefix(any(), any()) } returns prefixTestFile3
                every { Dialog.requestMimoFileSelection(any(), any()) } returns listOf(testFile1, testFile2, testFile3)

                CommandLine(MergeFilter()).execute(
                    testProjectFolder,
                    "--mimo",
                    "-nc"
                ).toString()

                val outputFileName = "$prefixTestFile3.merge.cc.json"
                val outputFile = File(outputFileName)
                val outputBufferedReader = outputFile.bufferedReader()
                val outputFileContent = outputBufferedReader.readText()

                assertThat(errContent.toString()).contains("Merged files with prefix '$prefixTestFile3' into '$outputFileName'")
                assertThat(outputFileContent).contains("ThirdTestAttribute")
                assertThat(outputFileContent).contains("Lines*")
                assertThat(outputFileContent).contains("AdditionalAttributeForTest")

                outputBufferedReader.close()
                outputFile.deleteOnExit()
            }
        }

        @Test
        fun `should merge two projects with exact name strictly if lvd is defined and skip single file`() {
            val prefix = "testProject"

            CommandLine(MergeFilter()).execute(
                testProjectFolder,
                "--mimo",
                "--levenshtein-distance=0"
            ).toString()

            val outputFileName = "$prefix.merge.cc.json.gz"
            val outputFile = File(outputFileName)

            assertThat(errContent.toString()).contains("Merged files with prefix '$prefix' into '$outputFileName'")
            assertThat(errContent.toString()).contains("Discarded 'testProjectX' of testProjectX.notIncl.cc.json as a potential group")
            assertThat(outputFile).exists()

            outputFile.deleteOnExit()
        }

        @Test
        fun `should merge two projects with output at the given location`() {
            val prefix = "testProject"
            val outputFolder = "src/test/resources"

            CommandLine(MergeFilter()).execute(
                testProjectPathA,
                testProjectPathB,
                "--mimo",
                "--levenshtein-distance=0",
                "-o=$outputFolder"
            ).toString()

            val outputFileName = "$prefix.merge.cc.json.gz"
            val outputFile = File("$outputFolder/$outputFileName")

            assertThat(errContent.toString()).contains("Merged files with prefix '$prefix' into '$outputFileName'")
            assertThat(outputFile).exists()

            outputFile.deleteOnExit()
        }

        @Test
        fun `should throw error if output-file is not a folder`() {
            val invalidOutputPath = "src/test/resources/invalid.cc.json"

            CommandLine(MergeFilter()).execute(
                testProjectPathA,
                testProjectPathB,
                "--mimo",
                "--levenshtein-distance=0",
                "-o=$invalidOutputPath"
            ).toString()

            assertThat(errContent.toString()).contains("Please specify a folder for MIMO output or nothing")
        }
    }

    @Nested
    @DisplayName("LargeMergeTests")
    inner class LargeMergeTest {
        private val fatMergeTestFolder = "src/test/resources/largeMerge"
        private val testFilePath1 = "$fatMergeTestFolder/testEdges1.cc.json"
        private val testFilePath2 = "$fatMergeTestFolder/testProject.alpha.cc.json"
        private val testFilePathDuplicate = "$fatMergeTestFolder/duplicate/testProject.beta.cc.json"

        @Test
        fun `should warn about invalid files during fat merge and abort`() {
            CommandLine(MergeFilter()).execute(
                "src/test/resources/invalid.cc.json",
                "--large"
            ).toString()

            assertThat(errContent.toString()).contains("Input invalid files/folders for MergeFilter, stopping execution...")
        }

        @Test
        fun `should exit when prefixes are not unique`() {
            CommandLine(MergeFilter()).execute(
                testFilePath1,
                testFilePath2,
                testFilePathDuplicate,
                "--large"
            ).toString()

            assertThat(errContent.toString()).contains("Make sure that the input prefixes across all input files are unique!")
        }

        @Test
        fun `should cancel on single file input`() {
            CommandLine(MergeFilter()).execute(
                testFilePath1,
                "--large"
            ).toString()

            assertThat(errContent.toString()).contains("One or less projects in input, merging aborted.")
        }

        @Test
        fun `should merge all projects into one file each packaged into a subfolder with input file's prefix`() {
            CommandLine(MergeFilter()).execute(
                testFilePath1,
                testFilePath2,
                "--large"
            ).toString()

            val outputString = outContent.toString()
            assertThat(outputString).contains("testProject", "testEdges1")
            assertThat(outputString).contains("SourceMonCsvConverter", "number_of_commits")
            assertThat(
                outputString
            ).contains("/root/testEdges1/visualization/file2", "/root/testEdges1/visualization/file3", "/root/testEdges1/file1")
        }

        @Test
        fun `should output into specified file`() {
            val outputFilePath = "$fatMergeTestFolder/largeOutputToFile.cc.json"
            CommandLine(MergeFilter()).execute(
                testFilePath1,
                testFilePath2,
                "--large",
                "-o=$outputFilePath",
                "-nc"
            ).toString()
            val outputFile = File(outputFilePath)
            assertThat(outputFile).exists()
            val outputFileInputStream = outputFile.inputStream()
            val project = ProjectDeserializer.deserializeProject(outputFileInputStream)
            val projectInput1 = ProjectDeserializer.deserializeProject(File(testFilePath1).inputStream())
            val projectInput2 = ProjectDeserializer.deserializeProject(File(testFilePath2).inputStream())
            assertThat(project.sizeOfEdges()).isEqualTo(2)
            assertThat(project.sizeOfBlacklist()).isEqualTo(2)
            assertThat(project.edges.toString()).contains("/root/testEdges1/visualization/file2", "/root/testEdges1/visualization/file3")
            assertThat(project.rootNode.children.size).isEqualTo(2)
            val outputProject1 = project.rootNode.children.first { it.name == "testEdges1" }
            val outputProject2 = project.rootNode.children.first { it.name == "testProject" }
            assertThat(outputProject1.children.toString()).isEqualTo(projectInput1.rootNode.children.toString())
            assertThat(outputProject2.children.toString()).isEqualTo(projectInput2.rootNode.children.toString())
            outputFileInputStream.close()
            outputFile.deleteOnExit()
        }

        @Test
        fun `should throw error if input project does not contain a strict root node`() {
            val customRootProject = "$fatMergeTestFolder/duplicate/customRootFailure.cc.json"

            CommandLine(MergeFilter()).execute(
                testFilePath1,
                testFilePath2,
                customRootProject,
                "--large"
            ).toString()

            assertThat(
                errContent.toString()
            ).contains("Input project structure doesn't have '/root/' as a base folder. If that's intended open an issue.")
        }
    }

    private fun mockRunInTerminalSession() {
        mockkStatic("de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterfaceKt")
        every { runInTerminalSession(any<Session.() -> Any>()) } answers {
            runInTestSession { firstArg<Session.() -> Any>()(this) }
        }
    }

    private fun <T> runInTestSession(block: Session.() -> T): T {
        var returnValue: T? = null
        testSession {
            returnValue = block()
        }
        return returnValue ?: throw IllegalStateException("Session did not return a value.")
    }
}
