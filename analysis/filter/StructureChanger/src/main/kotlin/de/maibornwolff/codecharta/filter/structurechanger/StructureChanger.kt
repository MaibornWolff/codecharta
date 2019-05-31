package de.maibornwolff.codecharta.filter.structurechanger

import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import mu.KotlinLogging
import picocli.CommandLine
import java.io.File
import java.util.concurrent.Callable

@CommandLine.Command(name = "structurechanger",
        description = ["changes the structure of cc.json files"],
        footer = ["Copyright(c) 2019, MaibornWolff GmbH"])
class StructureChanger : Callable<Void?> {

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    var help: Boolean = false

    @CommandLine.Parameters(arity = "1", paramLabel = "FILE", description = ["input project file"])
    private var source: File = File("")

    @CommandLine.Option(arity = "1..*", names = ["-e", "--extractSubProject"], description = ["project path to be extracted"])
    private var paths: Array<String> = arrayOf()

    @CommandLine.Option(arity = "1", names = ["-i", "--inspectStructure"], description = ["show first x layers of project hierarchy"])
    private var showStructure: Int = 0

    @CommandLine.Option(names = ["-o", "--outputFile"], description = ["output File (or empty for stdout)"])
    private var outputFile: File? = null

    @CommandLine.Option(names = ["-p", "--projectName"], description = ["project name of new file"])
    private var projectName: String? = null

    @CommandLine.Option(names = ["-f", "--moveFrom"], description = ["move nodes in project folder..."])
    private var moveFrom: String? = null

    @CommandLine.Option(names = ["-t", "--moveTo"], description = ["... move nodes to destination folder"])
    private var moveTo: String? = null

    private lateinit var srcProject: Project
    private var toMove: List<MutableNode>? = null
    private val logger = KotlinLogging.logger {}

    override fun call(): Void? {

        srcProject = readProject() ?: return null

        when {
            showStructure > 0 -> {
                ProjectStructurePrinter(srcProject).printProjectStructure(showStructure)
                return null
            }
            paths.isNotEmpty() -> srcProject = SubProjectExtractor(srcProject).extract(paths, projectName)
            moveFrom != null -> srcProject = FolderMover(srcProject).move(moveFrom, moveTo) ?: return null
        }

        val writer = outputFile?.bufferedWriter() ?: System.out.bufferedWriter()
        ProjectSerializer.serializeProject(srcProject, writer)

        return null
    }

    private fun readProject(): Project? {
        val bufferedReader = source.bufferedReader()
        return try {
            ProjectDeserializer.deserializeProject(bufferedReader)
        } catch (e: Exception) {
            logger.warn("${source.name} is not a valid project file and is therefore skipped.")
            null
        }
    }

    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            CommandLine.call(StructureChanger(), System.out, *args)
        }
    }
}
