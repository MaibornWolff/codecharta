package de.maibornwolff.codecharta.filter.mergefilter

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptCheckboxObject
import com.github.kinquirer.components.promptList
import com.github.kinquirer.core.Choice
import de.maibornwolff.codecharta.filter.mergefilter.MergeFilter.Companion.main
import de.maibornwolff.codecharta.tools.interactiveparser.InputType
import de.maibornwolff.codecharta.util.InputHelper
import io.mockk.every
import io.mockk.mockkObject
import io.mockk.mockkStatic
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import picocli.CommandLine
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.PrintStream

class MergeFilterTest {
    val outContent = ByteArrayOutputStream()
    val originalOut = System.out
    val errContent = ByteArrayOutputStream()
    val originalErr = System.err

    @AfterEach
    fun unmockEverything() {
        unmockkAll()
    }

    @Test
    fun `should merge all files in a folder correctly`() {
        val projectLocation = "src/test/resources/mergeFolderTest"
        val invalidFile = "invalid.json"

        System.setOut(PrintStream(outContent))
        System.setErr(PrintStream(errContent))
        CommandLine(MergeFilter()).execute(projectLocation).toString()
        System.setOut(originalOut)
        System.setErr(originalErr)

        // should ignore files starting with a dot
        assertThat(outContent.toString()).doesNotContain("ShouldNotAppear.java")

        // should warn about skipped files
        assertThat(errContent.toString()).contains(invalidFile)
    }

    @Test
    fun `should merge all indicated files`() {
        System.setOut(PrintStream(outContent))
        CommandLine(MergeFilter()).execute(
            "src/test/resources/mergeFolderTest/file1.cc.json",
            "src/test/resources/mergeFolderTest/file2.cc.json"
        ).toString()
        System.setOut(originalOut)
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
        System.setOut(PrintStream(outContent))
        CommandLine(MergeFilter()).execute(
            "src/test/resources/mergeFolderTest/file1_no_overlap.cc.json",
            "src/test/resources/mergeFolderTest/file2_no_overlap.cc.json",
            "-f"
        ).toString()
        System.setOut(originalOut)
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
        mockkObject(InputHelper)
        every {
            InputHelper.isInputValid(any(), any())
        } returns false

        System.setErr(PrintStream(errContent))
        CommandLine(MergeFilter()).execute(
            "src/test/resources/mergeFolderTest/file1.cc.json",
            "src/test/resources/thisDoesNotExist.cc.json"
        ).toString()
        System.setErr(originalErr)

        assertThat(errContent.toString()).contains("Input invalid files/folders for MergeFilter, stopping execution")
    }

    @Test
    fun `should warn if no top-level overlap and ask user to force merge`() {
        mockkObject(ParserDialog)
        every {
            ParserDialog.askForceMerge()
        } returns true

        System.setOut(PrintStream(outContent))
        System.setErr(PrintStream(errContent))
        CommandLine(MergeFilter()).execute(
            "src/test/resources/mergeFolderTest/file1_no_overlap.cc.json",
            "src/test/resources/mergeFolderTest/file2_no_overlap.cc.json"
        ).toString()
        System.setOut(originalOut)
        System.setErr(originalErr)

        assertThat(errContent.toString()).contains("Warning: No top-level overlap between projects")

        val valueInFile1 = "JavaParserTest.java"
        val valueInFile2 = "JavaParser.java"
        assertThat(outContent.toString()).contains(valueInFile1)
        assertThat(outContent.toString()).contains(valueInFile2)
    }

    @Test
    fun `should cancel merge if no top-level overlap and user declines force merge`() {
        mockkObject(ParserDialog)
        every {
            ParserDialog.askForceMerge()
        } returns false

        System.setOut(PrintStream(outContent))
        System.setErr(PrintStream(errContent))
        CommandLine(MergeFilter()).execute(
            "src/test/resources/mergeFolderTest/file1_no_overlap.cc.json",
            "src/test/resources/mergeFolderTest/file2_no_overlap.cc.json"
        ).toString()
        System.setOut(originalOut)
        System.setErr(originalErr)

        assertThat(errContent.toString()).contains("Warning: No top-level overlap between projects")

        assertThat(outContent.toString()).doesNotContain("SourceMonCsvConverter.java")
    }

    @Test
    fun `should return ParserDialog when getDialog is called`() {
        val mergeFilter = MergeFilter()

        assertThat(mergeFilter.getDialog()).isSameAs(ParserDialog)
    }

    @Test
    fun `should return false for isApplicable`() {
        val mergeFilter = MergeFilter()

        assertThat(mergeFilter.isApplicable("resourceToBeParsed")).isFalse
    }

    @Test
    fun `should log error when folder path is invalid`() {
        mockkObject(ParserDialog)

        every {
            ParserDialog.getInputFileName("cc.json", InputType.FOLDER)
        } returns "invalid/folder/path"

        System.setErr(PrintStream(errContent))
        CommandLine(MergeFilter()).execute("invalid/folder/path").toString()
        System.setErr(originalErr)

        assertThat(errContent.toString()).contains("Input invalid files/folders for MergeFilter, stopping execution...")
    }

    @Test
    fun `should log error when no cc json files found in folder`() {
        mockkObject(ParserDialog)

        every {
            ParserDialog.getInputFileName("cc.json", InputType.FOLDER)
        } returns "src/test/resources/emptyFolder"

        val emptyFolder = File("src/test/resources/emptyFolder")
        emptyFolder.mkdirs()
        emptyFolder.deleteOnExit()

        System.setErr(PrintStream(errContent))
        CommandLine(MergeFilter()).execute(emptyFolder.absolutePath).toString()
        System.setErr(originalErr)

        assertThat(errContent.toString()).contains("Input invalid files/folders for MergeFilter, stopping execution...")
    }

    @Test
    fun `should throw exception when both merging strategies are set`() {
        System.setErr(PrintStream(errContent))
        CommandLine(MergeFilter()).execute(
            "src/test/resources/test.json",
            "src/test/resources/test2.json",
            "--leaf=false",
            "--recursive=false"
        )

        System.setErr(originalErr)

        assertThat(errContent.toString()).contains("At least one merging strategy must be set")
    }

    @Nested
    @DisplayName("MimoModeTests")
    inner class MimoModeTest {
        val testFile1Path = "src/test/resources/test.json"
        val testProjectPathA = "src/test/resources/mimoFileSelection/testProject.alpha.cc.json"
        val testProjectPathB = "src/test/resources/mimoFileSelection/testProject.beta.cc.json"
        val testProjectPathC = "src/test/resources/mimoFileSelection/testProjectX.notIncl.cc.json"
        val invalidTestProjectPath = "src/test/resources/testProject.invalid.cc.json"
        val testProjectFolder = "src/test/resources/mimoFileSelection"

        val testNoOverlapPath1 = "src/test/resources/mimoOverlap/prefix.file1_no_overlap.cc.json"
        val testNoOverlapPath2 = "src/test/resources/mimoOverlap/prefix.file2_no_overlap.cc.json"

        @Test
        fun `should warn about invalid files during mimo merge and abort`() {
            System.setErr(PrintStream(errContent))
            CommandLine(MergeFilter()).execute(
                "src/test/resources/invalid.cc.json",
                "--mimo"
            ).toString()
            System.setErr(originalErr)

            assertThat(errContent.toString()).contains("Input invalid files/folders for MergeFilter, stopping execution...")
        }

        @Test
        fun `should handle single file gracefully in mimo mode`() {
            System.setErr(PrintStream(errContent))
            CommandLine(MergeFilter()).execute(
                testFile1Path,
                "--mimo"
            ).toString()
            System.setErr(originalErr)

            assertThat(errContent.toString()).contains("Discarded 'test' of test.json as a potential group")
        }

        @Nested
        @DisplayName("FileSelection")
        inner class MimoFileSelection {
            @Test
            fun `should merge two selected files if two of three are selected`() {
                val testFile1 = File(testProjectPathA)
                val testFile2 = File(testProjectPathB)

                mockkObject(ParserDialog)
                every { ParserDialog.requestMimoFileSelection(any()) } returns listOf(testFile1, testFile2)

                System.setOut(PrintStream(outContent))
                System.setErr(PrintStream(errContent))
                CommandLine(MergeFilter()).execute(
                    testProjectFolder,
                    "--mimo",
                    "-nc"
                ).toString()
                System.setOut(originalOut)
                System.setErr(originalErr)

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

                mockkObject(ParserDialog)
                every { ParserDialog.requestMimoFileSelection(any()) } returns listOf(testFile1)

                System.setOut(PrintStream(outContent))
                System.setErr(PrintStream(errContent))
                CommandLine(MergeFilter()).execute(
                    testProjectFolder,
                    "--mimo",
                    "-nc"
                ).toString()
                System.setOut(originalOut)
                System.setErr(originalErr)

                assertThat(errContent.toString()).contains("Continue with next group, because one or less files were selected")
            }

            @Test
            fun `should warn if only one file valid after deserializing`() {
                val invalidTestFile = File(invalidTestProjectPath)

                System.setOut(PrintStream(outContent))
                System.setErr(PrintStream(errContent))
                CommandLine(MergeFilter()).execute(
                    testProjectPathA,
                    invalidTestProjectPath,
                    "--mimo",
                    "-nc"
                ).toString()
                System.setOut(originalOut)
                System.setErr(originalErr)

                assertThat(errContent.toString()).contains(
                    "${invalidTestFile.name} is not a valid project file and will be skipped"
                )
                assertThat(errContent.toString()).contains(
                    "After deserializing there were one or less projects. Continue with next group"
                )
            }

            @Test
            fun `should merge two input files without name or file or overlap question`() {
                System.setOut(PrintStream(outContent))
                System.setErr(PrintStream(errContent))
                CommandLine(MergeFilter()).execute(
                    testProjectPathA,
                    testProjectPathB,
                    "--mimo",
                    "-nc"
                )
                System.setOut(originalOut)
                System.setErr(originalErr)

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
            mockkObject(ParserDialog)
            every { ParserDialog.askForceMerge() } returns false

            System.setErr(PrintStream(errContent))
            CommandLine(MergeFilter()).execute(
                testNoOverlapPath1,
                testNoOverlapPath2,
                "--mimo"
            )
            System.setErr(originalErr)

            assertThat(errContent.toString()).contains("No top-level overlap between projects. Missing first-level nodes")
        }

        @Test
        fun `should not warn if no top-level overlap for mimo and merge`() {
            mockkObject(ParserDialog)
            every { ParserDialog.askForceMerge() } returns false

            System.setErr(PrintStream(errContent))
            CommandLine(MergeFilter()).execute(
                testNoOverlapPath1,
                testNoOverlapPath2,
                "--mimo",
                "-f",
                "-nc"
            )
            System.setErr(originalErr)

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

                mockkObject(ParserDialog)
                mockkStatic("com.github.kinquirer.components.CheckboxKt", "com.github.kinquirer.components.ListKt")
                every {
                    KInquirer.promptList(any(), any(), any(), any(), any())
                } returns prefixTestFile3
                every {
                    KInquirer.promptCheckboxObject(any(), any<List<Choice<File>>>(), any(),any(), any(), any(),any())
                } returns listOf(testFile1, testFile2, testFile3)

                System.setErr(PrintStream(errContent))
                CommandLine(MergeFilter()).execute(
                    testProjectFolder,
                    "--mimo",
                    "-nc"
                ).toString()

                System.setErr(originalErr)

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

            System.setErr(PrintStream(errContent))
            CommandLine(MergeFilter()).execute(
                testProjectFolder,
                "--mimo",
                "--levenshtein-distance=0"
            ).toString()

            System.setErr(originalErr)

            val outputFileName = "$prefix.merge.cc.json.gz"
            val outputFile = File(outputFileName)

            assertThat(errContent.toString()).contains("Merged files with prefix '$prefix' into '$outputFileName'")
            assertThat(errContent.toString()).contains("Discarded 'testProjectX' of testProjectX.notIncl.cc.json as a potential group")
            assertThat(outputFile).exists()

            outputFile.deleteOnExit()
        }
    }
}
