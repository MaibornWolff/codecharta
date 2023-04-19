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
import io.mockk.*
import org.junit.jupiter.api.*
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

    private fun getExpectedParsers() : List<InteractiveParser> {
        return listOf<InteractiveParser>(CSVExporter(),
                EdgeFilter(), MergeFilter(),
                StructureModifier(), CSVImporter(),
                SonarImporterMain(), SourceMonitorImporter(),
                SVNLogParser(), GitLogParser(),
                SourceCodeParserMain(), CodeMaatImporter(),
                TokeiImporter(), RawTextParser(), MetricGardenerImporter())
    }

    private fun getExpectedParserNamesWithDescription() : List<String> {
        return listOf(CSVExporter().getName() + " - generates csv file with header",
                EdgeFilter().getName() + " - aggregates edgeAttributes as nodeAttributes into a new cc.json file",
                MergeFilter().getName() + " - merges multiple cc.json files",
                StructureModifier().getName() + " - changes the structure of cc.json files",
                CSVImporter().getName() + " - generates cc.json from csv with header",
                SonarImporterMain().getName() + " - generates cc.json from metric data from SonarQube",
                SourceMonitorImporter().getName() + " - generates cc.json from sourcemonitor csv",
                SVNLogParser().getName() + " - generates cc.json from svn log file",
                GitLogParser().getName() + " - git log parser - generates cc.json from git-log files",
                SourceCodeParserMain().getName() + " - generates cc.json from source code",
                CodeMaatImporter().getName() + " - generates cc.json from codemaat coupling csv",
                TokeiImporter().getName() + " - generates cc.json from tokei json",
                RawTextParser().getName() + " - generates cc.json from projects or source code files",
                MetricGardenerImporter().getName() + " - generates a cc.json file from a project parsed with metric-gardener")
    }

    @Test
    fun `should return all interactive parsers`() {
        val expectedParsers = getExpectedParsers()
        val expectedParserNames = expectedParsers.map { it.getName() }

        val actualParsers = picocliParserRepository.getAllParsers(cmdLine)
        val actualParserNames = actualParsers.map { it.getName() }

        for(parser in expectedParserNames) {
            Assertions.assertTrue(actualParserNames.contains(parser))
        }
    }

    @Test
    fun `should return all interactive parser names`() {
        val expectedParsers = getExpectedParsers()
        val expectedParserNames = expectedParsers.map { it.getName() }

        val actualParserNames = picocliParserRepository.getParserNames(cmdLine)

        for(parser in expectedParserNames) {
            Assertions.assertTrue(actualParserNames.contains(parser))
        }
    }

    @Test
    fun `should return all usable parser names`() {
        // Names are chosen arbitrarily
        val usableParser = mockParserObject("gitlogparser", true)
        val unusableParser = mockParserObject("sonarimport", false)

        val usableParsers = picocliParserRepository.getUsableParserNames("input", listOf(usableParser, unusableParser))

        Assertions.assertTrue(usableParsers.contains("gitlogparser"))
        Assertions.assertFalse(usableParsers.contains("sonarimport"))
    }

    @Test
    fun `should return all parser names with description`() {
        // Names are chosen arbitrarily
        val expectedParserNamesWithDescription = getExpectedParserNamesWithDescription()

        val actualParserNamesWithDescription = picocliParserRepository.getParserNamesWithDescription(cmdLine)

        for (parserNameWithDescription in expectedParserNamesWithDescription) {
            Assertions.assertTrue(actualParserNamesWithDescription.contains(parserNameWithDescription))
        }
    }

    @Test
    fun `should return the selected parser name`() {
        val expectedParserNamesWithDescription = getExpectedParserNamesWithDescription()
        val expectedParsers = getExpectedParsers()
        val expectedParserNames = expectedParsers.map { it.getName() }

        for(parser in expectedParserNamesWithDescription) {
            Assertions.assertTrue(expectedParserNames.contains(picocliParserRepository.extractParserName(parser)))
        }
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
            obj.isUsable(any())
        } returns isUsable
        every {
            obj.getName()
        } returns name
        mockkConstructor(CommandLine::class)
        every { anyConstructed<CommandLine>().execute(*dummyArgs.toTypedArray()) } returns 0
        return obj
    }

}
