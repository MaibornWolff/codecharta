package de.maibornwolff.codecharta.ccsh.parser.repository

import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import de.maibornwolff.codecharta.analysers.exporters.csv.CSVExporter
import de.maibornwolff.codecharta.analysers.filters.edgefilter.EdgeFilter
import de.maibornwolff.codecharta.analysers.filters.mergefilter.MergeFilter
import de.maibornwolff.codecharta.analysers.filters.structuremodifier.StructureModifier
import de.maibornwolff.codecharta.analysers.tools.inspection.InspectionTool
import de.maibornwolff.codecharta.analysers.tools.validation.ValidationTool
import de.maibornwolff.codecharta.analysis.importer.codemaat.CodeMaatImporter
import de.maibornwolff.codecharta.analysis.importer.csv.CSVImporter
import de.maibornwolff.codecharta.analysis.importer.sonar.SonarImporter
import de.maibornwolff.codecharta.analysis.importer.sourcemonitor.SourceMonitorImporter
import de.maibornwolff.codecharta.analysis.importer.tokeiimporter.TokeiImporter
import de.maibornwolff.codecharta.ccsh.Ccsh
import de.maibornwolff.codecharta.parser.gitlogparser.GitLogParser
import de.maibornwolff.codecharta.parser.rawtextparser.RawTextParser
import de.maibornwolff.codecharta.parser.sourcecodeparser.SourceCodeParser
import de.maibornwolff.codecharta.parser.svnlogparser.SVNLogParser
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
class PicocliParserRepositoryTest {
    private val outContent = ByteArrayOutputStream()
    private val originalOut = System.out
    private val cmdLine = CommandLine(Ccsh())

    private val picocliParserRepository = PicocliParserRepository()

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

    private fun getExpectedParsers(): List<AnalyserInterface> {
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
        fun getArgumentsOfExpectedParserNamesWithDescriptions(): List<Arguments> {
            val expectedParserNamesWithDescriptions = getExpectedParserNamesWithDescription()
            val result = mutableListOf<Arguments>()

            for (expectedParserNameWithDescription in expectedParserNamesWithDescriptions) {
                result.add(Arguments.of(expectedParserNameWithDescription))
            }
            return result
        }

        fun getExpectedParserNamesWithDescription(): List<List<String>> {
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
    fun `should return all interactive parsers`() {
        val expectedParsers = getExpectedParsers()
        val expectedParserNames = expectedParsers.map { it.getParserName() }

        val actualParsers = picocliParserRepository.getAllAnalyserInterfaces(cmdLine)
        val actualParserNames = actualParsers.map { it.getParserName() }

        for (parser in expectedParserNames) {
            Assertions.assertTrue(actualParserNames.contains(parser))
        }
    }

    @Test
    fun `should return all interactive parser names`() {
        val expectedParsers = getExpectedParsers()
        val expectedParserNames = expectedParsers.map { it.getParserName() }

        val actualParserNames = picocliParserRepository.getAnalyserInterfaceNames(cmdLine)

        for (parser in expectedParserNames) {
            Assertions.assertTrue(actualParserNames.contains(parser))
        }
    }

    @Test
    fun `should return only applicable parser names with description`() {
        val usableParser = mockParserObject("gitlogparser", true)
        val unusableParser = mockParserObject("sonarimport", false)

        val usableParsers =
            picocliParserRepository.getApplicableAnalyserNamesWithDescription(
                "input",
                listOf(usableParser, unusableParser)
            )

        Assertions.assertTrue(usableParsers.contains("gitlogparser - generates cc.json from git-log files"))
        Assertions.assertFalse(
            usableParsers.contains("sonarimport - generates cc.json from metric data from SonarQube")
        )
    }

    @ParameterizedTest
    @MethodSource("getArgumentsOfExpectedParserNamesWithDescriptions")
    fun `should return all applicable parser names with description`(parserNameWithDescription: List<String>) {
        val parser = mockParserObject(parserNameWithDescription[0], true)
        val parserNameAndDescription = parserNameWithDescription[0] + parserNameWithDescription[1]

        val applicableParser =
            picocliParserRepository.getApplicableAnalyserNamesWithDescription("input", listOf(parser))

        Assertions.assertTrue(applicableParser.size == 1)
        Assertions.assertTrue(applicableParser[0] == parserNameAndDescription)
    }

    @Test
    fun `should return all parser names with description`() {
        val expectedParserNamesWithDescription = getExpectedParserNamesWithDescription()

        val actualParserNamesWithDescription = picocliParserRepository.getAnalyserInterfaceNamesWithDescription(cmdLine)

        for (parserNameWithDescriptionList in expectedParserNamesWithDescription) {
            val parserNameWithDescription = parserNameWithDescriptionList[0] + parserNameWithDescriptionList[1]
            Assertions.assertTrue(
                actualParserNamesWithDescription.contains(parserNameWithDescription)
            )
        }
    }

    @Test
    fun `should return the selected parser name`() {
        val expectedParserNamesWithDescription = getExpectedParserNamesWithDescription()
        val expectedParsers = getExpectedParsers()
        val expectedParserNames = expectedParsers.map { it.getParserName() }

        for (parserNameDescriptionList in expectedParserNamesWithDescription) {
            val parserName = parserNameDescriptionList[0]
            Assertions.assertTrue(
                expectedParserNames.contains(
                    picocliParserRepository.extractParserName(parserName)
                )
            )
        }
    }

    @Test
    fun `should not crash when trying to get invalid parser name and output message`() {
        val parserName = picocliParserRepository.getAnalyserInterface(cmdLine, "nonexistent")

        Assertions.assertNull(parserName)
        Assertions.assertTrue(
            outContent.toString().contains("Could not find the specified parser with the name 'nonexistent'!")
        )
    }

    private fun mockParserObject(name: String, isUsable: Boolean): AnalyserInterface {
        val obj = cmdLine.subcommands[name]!!.commandSpec.userObject() as AnalyserInterface
        mockkObject(obj)
        val dialogInterface = mockkClass(AnalyserDialogInterface::class)
        val dummyArgs = listOf("dummyArg")
        every {
            dialogInterface.collectParserArgs(any())
        } returns dummyArgs
        every {
            obj.getDialog()
        } returns dialogInterface
        every {
            obj.isApplicable(any())
        } returns isUsable
        every {
            obj.getParserName()
        } returns name
        mockkConstructor(CommandLine::class)
        every { anyConstructed<CommandLine>().execute(*dummyArgs.toTypedArray()) } returns 0
        return obj
    }
}
