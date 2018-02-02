package de.maibornwolff.codecharta.importer.csv

import com.google.common.collect.ImmutableList
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import picocli.CommandLine
import java.io.*
import java.util.*
import java.util.concurrent.Callable

@CommandLine.Command(
        name = "csvimport",
        description = ["generates cc.json from csv with header"],
        footer = ["Copyright(c) 2018, MaibornWolff GmbH"]
)
class CSVImporter : Callable<Void> {

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Option(names = ["-d", "--delimeter"], description = ["delimeter in csv file"])
    private var csvDelimiter = ','

    @CommandLine.Option(names = ["-p", "--projectName"], description = ["project name"])
    private var projectName = "SCMLogParser"

    @CommandLine.Option(names = ["--pathSeparator"], description = ["path separator (default = '/')"])
    private var pathSeparator = '/'

    @CommandLine.Parameters(arity = "1..*", paramLabel = "FILE", description = ["csv files"])
    private var files = ArrayList<String>()

    @Throws(IOException::class)
    override fun call(): Void? {
        val project = CSVProjectAdapter(projectName, pathSeparator, csvDelimiter)
        getInputStreamsFromArgs(files).forEach { project.addProjectFromCsv(it) }
        ProjectSerializer.serializeProject(project, OutputStreamWriter(System.out))

        return null
    }

    private fun getInputStreamsFromArgs(files: List<String>): List<InputStream> {
        val fileList = files.map { createFileInputStream(it) }
        return if (fileList.isEmpty()) ImmutableList.of(System.`in`) else fileList
    }

    private fun createFileInputStream(path: String): FileInputStream {
        try {
            return FileInputStream(path)
        } catch (e: FileNotFoundException) {
            throw RuntimeException("File $path not found.")
        }

    }

    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            CommandLine.call(CSVImporter(), System.out, *args)
        }
    }
}

