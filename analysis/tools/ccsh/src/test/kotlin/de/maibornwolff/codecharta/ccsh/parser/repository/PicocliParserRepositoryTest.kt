package de.maibornwolff.codecharta.ccsh.parser.repository

import de.maibornwolff.codecharta.exporter.csv.CSVExporter
import de.maibornwolff.codecharta.filter.edgefilter.EdgeFilter
import de.maibornwolff.codecharta.filter.mergefilter.MergeFilter
import de.maibornwolff.codecharta.filter.structuremodifier.StructureModifier
import de.maibornwolff.codecharta.importer.codemaat.CodeMaatImporter
import de.maibornwolff.codecharta.importer.csv.CSVImporter
import de.maibornwolff.codecharta.importer.gitlogparser.GitLogParser
import de.maibornwolff.codecharta.importer.metricgardenerimporter.MetricGardenerImporter
import de.maibornwolff.codecharta.importer.sonar.SonarImporterMain
import de.maibornwolff.codecharta.importer.sourcecodeparser.SourceCodeParserMain
import de.maibornwolff.codecharta.importer.sourcemonitor.SourceMonitorImporter
import de.maibornwolff.codecharta.importer.svnlogparser.SVNLogParser
import de.maibornwolff.codecharta.importer.tokeiimporter.TokeiImporter
import de.maibornwolff.codecharta.parser.rawtextparser.RawTextParser
import de.maibornwolff.codecharta.tools.ccsh.Ccsh
import de.maibornwolff.codecharta.tools.ccsh.parser.repository.PicocliParserRepository
import de.maibornwolff.codecharta.tools.interactiveparser.InteractiveParser
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import de.maibornwolff.codecharta.tools.validation.ValidationTool
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

    private fun getExpectedParsers(): List<InteractiveParser> {
        return listOf<InteractiveParser>(
        CSVExporter(),
                EdgeFilter(), MergeFilter(),
                StructureModifier(), CSVImporter(),
                SonarImporterMain(), SourceMonitorImporter(),
                SVNLogParser(), GitLogParser(),
                SourceCodeParserMain(), CodeMaatImporter(),
                TokeiImporter(), RawTextParser(),
                MetricGardenerImporter(), ValidationTool()
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
                    listOf(SonarImporterMain.NAME, " - " + SonarImporterMain.DESCRIPTION),
                    listOf(SourceMonitorImporter.NAME, " - " + SourceMonitorImporter.DESCRIPTION),
                    listOf(SVNLogParser.NAME, " - " + SVNLogParser.DESCRIPTION),
                    listOf(GitLogParser.NAME, " - " + GitLogParser.DESCRIPTION),
                    listOf(SourceCodeParserMain.NAME, " - " + SourceCodeParserMain.DESCRIPTION),
                    listOf(CodeMaatImporter.NAME, " - " + CodeMaatImporter.DESCRIPTION),
                    listOf(TokeiImporter.NAME, " - " + TokeiImporter.DESCRIPTION),
                    listOf(RawTextParser.NAME, " - " + RawTextParser.DESCRIPTION),
                    listOf(ValidationTool.NAME, " - " + ValidationTool.DESCRIPTION),
                    listOf(MetricGardenerImporter.NAME, " - " + MetricGardenerImporter.DESCRIPTION)
            )
        }
    }

    @Test
    fun `should return all interactive parsers`() {
        val expectedParsers = getExpectedParsers()
        val expectedParserNames = expectedParsers.map { it.getParserName() }

        val actualParsers = picocliParserRepository.getAllInteractiveParsers(cmdLine)
        val actualParserNames = actualParsers.map { it.getParserName() }

        for (parser in expectedParserNames) {
            Assertions.assertTrue(actualParserNames.contains(parser))
        }
    }

    @Test
    fun `should return all interactive parser names`() {
        val expectedParsers = getExpectedParsers()
        val expectedParserNames = expectedParsers.map { it.getParserName() }

        val actualParserNames = picocliParserRepository.getInteractiveParserNames(cmdLine)

        for (parser in expectedParserNames) {
            Assertions.assertTrue(actualParserNames.contains(parser))
        }
    }

    @Test
    fun `should return only applicable parser names with description`() {
        val usableParser = mockParserObject("gitlogparser", true)
        val unusableParser = mockParserObject("sonarimport", false)

        val usableParsers = picocliParserRepository.getApplicableInteractiveParserNamesWithDescription("input", listOf(usableParser, unusableParser))

        Assertions.assertTrue(usableParsers.contains("gitlogparser - generates cc.json from git-log files"))
        Assertions.assertFalse(usableParsers.contains("sonarimport - generates cc.json from metric data from SonarQube"))
    }

    @ParameterizedTest
    @MethodSource("getArgumentsOfExpectedParserNamesWithDescriptions")
    fun `should return all applicable parser names with description`(parserNameWithDescription: List<String>) {
        val parser = mockParserObject(parserNameWithDescription[0], true)
        val parserNameAndDescription = parserNameWithDescription[0] + parserNameWithDescription[1]

        val applicableParser = picocliParserRepository.getApplicableInteractiveParserNamesWithDescription("input", listOf(parser))

        Assertions.assertTrue(applicableParser.size == 1)
        Assertions.assertTrue(applicableParser[0] == parserNameAndDescription)
    }

    @Test
    fun `should return all parser names with description`() {
        val expectedParserNamesWithDescription = getExpectedParserNamesWithDescription()

        val actualParserNamesWithDescription = picocliParserRepository.getInteractiveParserNamesWithDescription(cmdLine)

        for (parserNameWithDescriptionList in expectedParserNamesWithDescription) {
            val parserNameWithDescription = parserNameWithDescriptionList[0] + parserNameWithDescriptionList[1]
            Assertions.assertTrue(
                    actualParserNamesWithDescription
                            .contains(parserNameWithDescription)
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
        val parserName = picocliParserRepository.getInteractiveParser(cmdLine, "nonexistent")

        Assertions.assertNull(parserName)
        Assertions.assertTrue(outContent.toString().contains("Could not find the specified parser with the name 'nonexistent'!"))
    }

    private fun mockParserObject(name: String, isUsable: Boolean): InteractiveParser {
        val obj = cmdLine.subcommands[name]!!.commandSpec.userObject() as InteractiveParser
        mockkObject(obj)
        val dialogInterface = mockkClass(ParserDialogInterface::class)
        val dummyArgs = listOf("dummyArg")
        every {
            dialogInterface.collectParserArgs()
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
