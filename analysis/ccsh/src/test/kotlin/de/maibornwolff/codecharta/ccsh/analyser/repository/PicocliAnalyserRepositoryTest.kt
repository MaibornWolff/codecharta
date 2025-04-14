package de.maibornwolff.codecharta.ccsh.analyser.repository

import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import de.maibornwolff.codecharta.analysers.exporters.csv.CSVExporter
import de.maibornwolff.codecharta.analysers.filters.edgefilter.EdgeFilter
import de.maibornwolff.codecharta.analysers.filters.mergefilter.MergeFilter
import de.maibornwolff.codecharta.analysers.filters.structuremodifier.StructureModifier
import de.maibornwolff.codecharta.analysers.importers.codemaat.CodeMaatImporter
import de.maibornwolff.codecharta.analysers.importers.csv.CSVImporter
import de.maibornwolff.codecharta.analysers.importers.sonar.SonarImporter
import de.maibornwolff.codecharta.analysers.importers.sourcemonitor.SourceMonitorImporter
import de.maibornwolff.codecharta.analysers.importers.tokei.TokeiImporter
import de.maibornwolff.codecharta.analysers.parsers.gitlog.GitLogParser
import de.maibornwolff.codecharta.analysers.parsers.rawtext.RawTextParser
import de.maibornwolff.codecharta.analysers.parsers.sourcecode.SourceCodeParser
import de.maibornwolff.codecharta.analysers.parsers.svnlog.SVNLogParser
import de.maibornwolff.codecharta.analysers.tools.inspection.InspectionTool
import de.maibornwolff.codecharta.analysers.tools.validation.ValidationTool
import de.maibornwolff.codecharta.ccsh.Ccsh
import io.mockk.every
import io.mockk.mockkClass
import io.mockk.mockkConstructor
import io.mockk.mockkObject
import io.mockk.unmockkAll
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.MethodSource
import picocli.CommandLine
import java.io.ByteArrayOutputStream
import java.io.PrintStream

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class PicocliAnalyserRepositoryTest {
    private val outContent = ByteArrayOutputStream()
    private val originalOut = System.out
    private val cmdLine = CommandLine(Ccsh())

    private val picocliAnalyserRepository = PicocliAnalyserRepository()

    @BeforeAll
    fun setUpStreams() {
        System.setOut(PrintStream(outContent))
    }

    @AfterAll
    fun restoreStreams() {
        System.setOut(originalOut)
    }

    @AfterEach
    fun afterTest() {
        unmockkAll()
    }

    private fun getExpectedAnalysers(): List<AnalyserInterface> {
        return listOf<AnalyserInterface>(
            CSVExporter(),
            EdgeFilter(), MergeFilter(),
            StructureModifier(), CSVImporter(),
            SonarImporter(), SourceMonitorImporter(),
            SVNLogParser(), GitLogParser(),
            SourceCodeParser(), CodeMaatImporter(),
            TokeiImporter(), RawTextParser(),
            ValidationTool(), InspectionTool()
        )
    }

    companion object {
        @JvmStatic
        fun getArgumentsOfExpectedAnalyserNamesWithDescriptions(): List<Arguments> {
            val expectedAnalyserNamesWithDescriptions = getExpectedAnalyserNamesWithDescription()
            val result = mutableListOf<Arguments>()

            for (expectedAnalyserNameWithDescription in expectedAnalyserNamesWithDescriptions) {
                result.add(Arguments.of(expectedAnalyserNameWithDescription))
            }
            return result
        }

        fun getExpectedAnalyserNamesWithDescription(): List<List<String>> {
            return listOf(
                listOf(CSVExporter.NAME, " - " + CSVExporter.DESCRIPTION),
                listOf(EdgeFilter.NAME, " - " + EdgeFilter.DESCRIPTION),
                listOf(MergeFilter.NAME, " - " + MergeFilter.DESCRIPTION),
                listOf(StructureModifier.NAME, " - " + StructureModifier.DESCRIPTION),
                listOf(CSVImporter.NAME, " - " + CSVImporter.DESCRIPTION),
                listOf(SonarImporter.NAME, " - " + SonarImporter.DESCRIPTION),
                listOf(SourceMonitorImporter.NAME, " - " + SourceMonitorImporter.DESCRIPTION),
                listOf(SVNLogParser.NAME, " - " + SVNLogParser.DESCRIPTION),
                listOf(GitLogParser.NAME, " - " + GitLogParser.DESCRIPTION),
                listOf(SourceCodeParser.NAME, " - " + SourceCodeParser.DESCRIPTION),
                listOf(CodeMaatImporter.NAME, " - " + CodeMaatImporter.DESCRIPTION),
                listOf(TokeiImporter.NAME, " - " + TokeiImporter.DESCRIPTION),
                listOf(RawTextParser.NAME, " - " + RawTextParser.DESCRIPTION),
                listOf(ValidationTool.NAME, " - " + ValidationTool.DESCRIPTION),
                listOf(InspectionTool.NAME, " - " + InspectionTool.DESCRIPTION)
            )
        }
    }

    @Test
    fun `should return all interactive analysers`() {
        val expectedAnalysers = getExpectedAnalysers()
        val expectedAnalyserNames = expectedAnalysers.map { it.getAnalyserName() }

        val actualAnalysers = picocliAnalyserRepository.getAllAnalyserInterfaces(cmdLine)
        val actualAnalyserNames = actualAnalysers.map { it.getAnalyserName() }

        for (analyser in expectedAnalyserNames) {
            Assertions.assertTrue(actualAnalyserNames.contains(analyser))
        }
    }

    @Test
    fun `should return all interactive analyser names`() {
        val expectedAnalysers = getExpectedAnalysers()
        val expectedAnalyserNames = expectedAnalysers.map { it.getAnalyserName() }

        val actualAnalyserNames = picocliAnalyserRepository.getAnalyserInterfaceNames(cmdLine)

        for (analyser in expectedAnalyserNames) {
            Assertions.assertTrue(actualAnalyserNames.contains(analyser))
        }
    }

    @Test
    fun `should return only applicable analyser names with description`() {
        val usableAnalyser = mockAnalyserObject("gitlogparser", true)
        val unusableAnalyser = mockAnalyserObject("sonarimport", false)

        val usableAnalysers =
            picocliAnalyserRepository.getApplicableAnalyserNamesWithDescription(
                "input",
                listOf(usableAnalyser, unusableAnalyser)
            )

        Assertions.assertTrue(usableAnalysers.contains("gitlogparser - generates cc.json from git-log files"))
        Assertions.assertFalse(
            usableAnalysers.contains("sonarimport - generates cc.json from metric data from SonarQube")
        )
    }

    @ParameterizedTest
    @MethodSource("getArgumentsOfExpectedAnalyserNamesWithDescriptions")
    fun `should return all applicable analyser names with description`(analyserNameWithDescription: List<String>) {
        val analyser = mockAnalyserObject(analyserNameWithDescription[0], true)
        val analyserNameAndDescription = analyserNameWithDescription[0] + analyserNameWithDescription[1]

        val applicableAnalyser =
            picocliAnalyserRepository.getApplicableAnalyserNamesWithDescription("input", listOf(analyser))

        Assertions.assertTrue(applicableAnalyser.size == 1)
        Assertions.assertTrue(applicableAnalyser[0] == analyserNameAndDescription)
    }

    @Test
    fun `should return all analyser names with description`() {
        val expectedAnalyserNamesWithDescription = getExpectedAnalyserNamesWithDescription()

        val actualAnalyserNamesWithDescription = picocliAnalyserRepository.getAnalyserInterfaceNamesWithDescription(cmdLine)

        for (analyserNameWithDescriptionList in expectedAnalyserNamesWithDescription) {
            val analyserNameWithDescription = analyserNameWithDescriptionList[0] + analyserNameWithDescriptionList[1]
            Assertions.assertTrue(
                actualAnalyserNamesWithDescription.contains(analyserNameWithDescription)
            )
        }
    }

    @Test
    fun `should return the selected analyser name`() {
        val expectedAnalyserNamesWithDescription = getExpectedAnalyserNamesWithDescription()
        val expectedAnalysers = getExpectedAnalysers()
        val expectedAnalyserNames = expectedAnalysers.map { it.getAnalyserName() }

        for (analyserNameDescriptionList in expectedAnalyserNamesWithDescription) {
            val analyserName = analyserNameDescriptionList[0]
            Assertions.assertTrue(
                expectedAnalyserNames.contains(
                    picocliAnalyserRepository.extractAnalyserName(analyserName)
                )
            )
        }
    }

    @Test
    fun `should not crash when trying to get invalid analyser name and output message`() {
        val analyserName = picocliAnalyserRepository.getAnalyserInterface(cmdLine, "nonexistent")

        Assertions.assertNull(analyserName)
        Assertions.assertTrue(
            outContent.toString().contains("Could not find the specified analyser with the name 'nonexistent'!")
        )
    }

    private fun mockAnalyserObject(name: String, isUsable: Boolean): AnalyserInterface {
        val obj = cmdLine.subcommands[name]!!.commandSpec.userObject() as AnalyserInterface
        mockkObject(obj)
        val dialogInterface = mockkClass(AnalyserDialogInterface::class)
        val dummyArgs = listOf("dummyArg")
        every {
            dialogInterface.collectAnalyserArgs(any())
        } returns dummyArgs
        every {
            obj.getDialog()
        } returns dialogInterface
        every {
            obj.isApplicable(any())
        } returns isUsable
        every {
            obj.getAnalyserName()
        } returns name
        mockkConstructor(CommandLine::class)
        every { anyConstructed<CommandLine>().execute(*dummyArgs.toTypedArray()) } returns 0
        return obj
    }
}
