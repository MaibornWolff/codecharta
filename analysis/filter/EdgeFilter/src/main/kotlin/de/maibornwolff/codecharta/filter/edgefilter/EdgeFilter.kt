package de.maibornwolff.codecharta.filter.edgefilter

import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import picocli.CommandLine
import java.io.File
import java.util.concurrent.Callable

@CommandLine.Command(
    name = "edgefilter",
    description = ["aggregtes edgeAttributes as nodeAttributes into a new cc.json file"],
    footer = ["Copyright(c) 2020, MaibornWolff GmbH"]
)
class EdgeFilter : Callable<Void?> {

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    var help: Boolean = false

    @CommandLine.Parameters(arity = "1..*", paramLabel = "FILE", description = ["files to filter"])
    private var source: String = ""

    @CommandLine.Option(names = ["--path-separator"], description = ["path separator (default = '/')"])
    private var pathSeparator = '/'

    @CommandLine.Option(names = ["-o", "--output-file"], description = ["output File (or empty for stdout)"])
    private var outputFile: File? = null

    override fun call(): Void? {
        val srcProject = ProjectDeserializer.deserializeProject(File(source).bufferedReader())

        val newProject = EdgeProjectBuilder(srcProject, pathSeparator).merge()

        val writer = outputFile?.bufferedWriter() ?: System.out.bufferedWriter()
        ProjectSerializer.serializeProject(newProject, writer)

        return null
    }

    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            CommandLine.call(EdgeFilter(), System.out, *args)
        }
    }
}
