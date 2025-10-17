package de.maibornwolff.codecharta.analysers.parsers.sourcecode

import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import de.maibornwolff.codecharta.model.AttributeDescriptor
import de.maibornwolff.codecharta.model.AttributeGenerator
import de.maibornwolff.codecharta.serialization.FileExtension
import de.maibornwolff.codecharta.util.CodeChartaConstants
import de.maibornwolff.codecharta.util.ResourceSearchHelper
import picocli.CommandLine
import java.io.PrintStream
import kotlin.system.exitProcess

@CommandLine.Command(
    name = SourceCodeParser.NAME,
    description = [SourceCodeParser.DESCRIPTION],
    footer = [SourceCodeParser.FOOTER]
)
class SourceCodeParser(
    private val output: PrintStream = System.out
) : AnalyserInterface, AttributeGenerator {
    constructor() : this(System.out)

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Parameters(arity = "0..*", description = ["(ignored) - parser has been deprecated"])
    private var ignoredArgs: List<String> = emptyList()

    @CommandLine.Unmatched
    private var unmatchedOptions: MutableList<String> = mutableListOf()

    override val name = NAME
    override val description = DESCRIPTION

    companion object {
        const val NAME = "sourcecodeparser"
        const val DESCRIPTION = "DEPRECATED - This parser has been removed!"
        const val FOOTER =
            "DEPRECATION NOTICE:\n" +
                "The SourceCodeParser has been deprecated and removed due to maintenance burden.\n\n" +
                "Please use one of these alternatives instead:\n" +
                "  • unifiedparser       - Modern parser supporting multiple languages\n" +
                "  • sonarimporter       - Import metrics from SonarQube analysis\n" +
                "  • coverageimporter    - Import code coverage data\n" +
                "  • rawtextparser       - Simple text-based metrics\n" +
                "  • tokeiimporter       - Line count and language statistics\n\n" +
                "For a complete analysis workflow, use the simplecc.sh script:\n" +
                "  analysis/script/simplecc.sh create <output-file>\n\n" +
                "This script combines multiple analyzers (tokei, complexity, git, rawtextparser, unifiedparser)\n" +
                "to provide comprehensive code metrics.\n\n" +
                CodeChartaConstants.GENERIC_FOOTER

        @JvmStatic
        fun main(args: Array<String>) {
            mainWithOutputStream(System.out, args)
        }

        @JvmStatic
        fun mainWithOutputStream(outputStream: PrintStream, args: Array<String>) {
            CommandLine(SourceCodeParser(outputStream)).execute(*args)
        }
    }

    override fun call(): Unit? {
        output.println()
        output.println("=".repeat(80))
        output.println("ERROR: SourceCodeParser has been DEPRECATED and REMOVED")
        output.println("=".repeat(80))
        output.println()
        output.println("The SourceCodeParser has been removed from CodeCharta due to high")
        output.println("maintenance burden and the availability of better alternatives.")
        output.println()
        output.println("Please use one of these alternatives:")
        output.println()
        output.println("  1. unifiedparser - Modern parser for multiple languages")
        output.println("     Example: ccsh unifiedparser <source-folder> -o output.cc.json")
        output.println()
        output.println("  2. sonarimporter - Import from SonarQube analysis")
        output.println("     Example: ccsh sonarimporter <sonar-url> <project-key> -o output.cc.json")
        output.println()
        output.println("  3. coverageimporter - Import code coverage data")
        output.println("     Example: ccsh coverageimporter <coverage-file> -o output.cc.json")
        output.println()
        output.println("  4. rawtextparser - Simple text-based metrics")
        output.println("     Example: ccsh rawtextparser <source-folder> -o output.cc.json")
        output.println()
        output.println("  5. tokeiimporter - Line count and language statistics")
        output.println("     Example: tokei . -o json | ccsh tokeiimporter /dev/stdin -o output.cc.json")
        output.println()
        output.println("For a complete analysis combining multiple tools, use:")
        output.println()
        output.println("  analysis/script/simplecc.sh create <output-file>")
        output.println()
        output.println("This script provides a comprehensive analysis using tokei, complexity,")
        output.println("git history, rawtextparser, and unifiedparser.")
        output.println()
        output.println("=".repeat(80))
        output.println()

        exitProcess(1)
    }

    override fun getDialog(): AnalyserDialogInterface {
        return AnalyserDialogInterface { _: Session -> emptyList() }
    }

    override fun isApplicable(resourceToBeParsed: String): Boolean {
        return false
    }

    override fun getAttributeDescriptorMaps(): Map<String, AttributeDescriptor> {
        return emptyMap()
    }
}
