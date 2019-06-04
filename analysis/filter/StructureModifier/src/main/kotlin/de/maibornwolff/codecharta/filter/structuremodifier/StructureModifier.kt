package de.maibornwolff.codecharta.filter.structuremodifier

import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import mu.KotlinLogging
import picocli.CommandLine
import java.io.File
import java.util.concurrent.Callable

@CommandLine.Command(name = "modify",
        description = ["changes the structure of cc.json files"],
        footer = ["Copyright(c) 2019, MaibornWolff GmbH"])
class StructureModifier : Callable<Void?> {

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    var help: Boolean = false

    @CommandLine.Parameters(arity = "1", paramLabel = "FILE", description = ["input project file"])
    private var source: File = File("")

    @CommandLine.Option(arity = "1..*", names = ["-s", "--setRoot"], description = ["path within project to be extracted"])
    private var setRoot: Array<String> = arrayOf()

    @CommandLine.Option(arity = "1", names = ["-p", "--printLevels"], description = ["show first x layers of project hierarchy"])
    private var printLevels: Int = 0

    @CommandLine.Option(names = ["-o", "--outputFile"], description = ["output File (or empty for stdout)"])
    private var outputFile: File? = null

    @CommandLine.Option(names = ["-n", "--projectName"], description = ["project name of new file"])
    private var projectName: String? = null

    @CommandLine.Option(names = ["-f", "--moveFrom"], description = ["move nodes in project folder..."])
    private var moveFrom: String? = null

    @CommandLine.Option(arity = "1..*", names = ["-r", "--remove"], description = ["node(s) to be removed"])
    private var remove: Array<String> = arrayOf()

    @CommandLine.Option(names = ["-t", "--moveTo"], description = ["... move nodes to destination folder"])
    private var moveTo: String? = null

    private lateinit var project: Project
    private val logger = KotlinLogging.logger {}

    override fun call(): Void? {

        project = readProject() ?: return null

        when {
            printLevels > 0 -> {
                ProjectStructurePrinter(project).printProjectStructure(printLevels)
                return null
            }
            setRoot.isNotEmpty() -> project = SubProjectExtractor(project).extract(setRoot, projectName)
            remove.isNotEmpty() -> project = NodeRemover(project).remove(remove) // ProjectName must be nullable
            moveFrom != null -> project = FolderMover(project).move(moveFrom, moveTo) ?: return null
        }

        val writer = outputFile?.bufferedWriter() ?: System.out.bufferedWriter()
        ProjectSerializer.serializeProject(project, writer)

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
            CommandLine.call(StructureModifier(), System.out, *args)
        }
    }
}
