package de.maibornwolff.codecharta.filter.structuremodifier

import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import mu.KotlinLogging
import picocli.CommandLine
import java.io.File
import java.io.InputStream
import java.io.PrintStream
import java.util.concurrent.Callable

@CommandLine.Command(name = "modify",
        description = ["changes the structure of cc.json files"],
        footer = ["Copyright(c) 2019, MaibornWolff GmbH"])
class StructureModifier(private val input: InputStream = System.`in`,
                        private val output: PrintStream = System.out,
                        private val error: PrintStream = System.err) : Callable<Void?> {

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    var help: Boolean = false

    @CommandLine.Parameters(arity = "0..1", paramLabel = "FILE", description = ["input project file"])
    private var source: File? = null

    @CommandLine.Option(names = ["-s", "--setRoot"], description = ["path within project to be extracted"])
    private var setRoot: String? = null

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
                ProjectStructurePrinter(project, output).printProjectStructure(printLevels)
                return null
            }
            setRoot != null -> project = SubProjectExtractor(project, projectName).extract(setRoot!!)
            remove.isNotEmpty() -> project = NodeRemover(project, projectName).remove(remove)
            moveFrom != null -> project = FolderMover(project, projectName).move(moveFrom, moveTo) ?: return null
        }

        val writer = outputFile?.bufferedWriter() ?: output.bufferedWriter()
        ProjectSerializer.serializeProject(project, writer)

        return null
    }

    private fun readProject(): Project? {
        if (source == null) {
            return ProjectDeserializer.deserializeProject(input)
        } else if (!source!!.isFile) {
            logger.error("${source!!.name} has not been found.")
            return null
        }

        val bufferedReader = source!!.bufferedReader()
        return try {
            ProjectDeserializer.deserializeProject(bufferedReader)
        } catch (e: Exception) {
            val input = source!!.name
            logger.error("$input is not a valid project file and is therefore skipped.")
            null
        }
    }

    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            mainWithInOut(System.`in`, System.out, System.err, args)
        }

        @JvmStatic
        fun mainWithInOut(input: InputStream, output: PrintStream, error: PrintStream, args: Array<String>) {
            CommandLine.call(StructureModifier(input, output, error), output, *args)
        }
    }
}


