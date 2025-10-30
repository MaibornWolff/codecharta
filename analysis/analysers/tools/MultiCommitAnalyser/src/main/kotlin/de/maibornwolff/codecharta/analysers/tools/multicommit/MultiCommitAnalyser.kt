package de.maibornwolff.codecharta.analysers.tools.multicommit

import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.util.CommaSeparatedParameterPreprocessor
import de.maibornwolff.codecharta.analysers.analyserinterface.util.CommaSeparatedStringToListConverter
import de.maibornwolff.codecharta.util.CodeChartaConstants
import de.maibornwolff.codecharta.util.Logger
import picocli.CommandLine

@CommandLine.Command(
    name = MultiCommitAnalyser.NAME,
    description = [MultiCommitAnalyser.DESCRIPTION],
    footer = [CodeChartaConstants.GENERIC_FOOTER]
)
class MultiCommitAnalyser : AnalyserInterface {
    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    var help: Boolean = false

    @CommandLine.Option(
        names = ["--commits"],
        description = [
            "comma-separated list of commit SHAs/refs " +
                "(when using powershell, the list either can't contain spaces or has to be in quotes)"
        ],
        required = true,
        converter = [(CommaSeparatedStringToListConverter::class)],
        preprocessor = CommaSeparatedParameterPreprocessor::class
    )
    private var commits: List<String> = listOf()

    @CommandLine.Option(
        names = ["-o", "--output"],
        description = ["base output filename (each commit will generate <short-commit-sha>_<output-filename>)"]
    )
    private var output: String? = null

    @CommandLine.Option(
        names = ["--parser"],
        arity = "1",
        description = ["the parser (and its arguments) that will be used to generate each map"],
        required = true
    )
    private var parser: String = ""

    @CommandLine.Option(
        names = ["--stash"],
        description = ["stash and restore uncommitted changes"]
    )
    private var stash: Boolean = false

    override val name = NAME
    override val description = DESCRIPTION

    companion object {
        const val NAME = "multicommitanalyser"
        const val DESCRIPTION = "generate CodeCharta maps for multiple commits at once"
    }

    override fun call(): Unit? {
        Logger.info { "MultiCommitAnalyser called with commits=$commits, output=$output, parser=$parser, stash=$stash" }
        // TODO: Implementation will be added in later tasks
        return null
    }

    override fun getDialog(): AnalyserDialogInterface = Dialog

    override fun isApplicable(resourceToBeParsed: String): Boolean {
        return false
    }
}
