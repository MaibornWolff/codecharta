package de.maibornwolff.codecharta.importer.csv

import de.maibornwolff.codecharta.serialization.ProjectSerializer
import picocli.CommandLine
import java.io.BufferedWriter
import java.io.File
import java.io.FileWriter
import java.io.IOException
import java.io.InputStream
import java.io.OutputStreamWriter
import java.io.Writer
import java.util.concurrent.Callable

@CommandLine.Command(
        name = "csvimport",
        description = ["generates cc.json from csv with header"],
        footer = ["Copyright(c) 2020, MaibornWolff GmbH"]
)
class CSVImporter : Callable<Void> {

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Option(names = ["-d", "--delimeter"], description = ["delimeter in csv file"])
    private var csvDelimiter = ','

    @CommandLine.Option(names = ["--path-separator"], description = ["path separator (default = '/')"])
    private var pathSeparator = '/'

    @CommandLine.Option(names = ["-c"], description = ["compress output File to gzip format"])
    private var compress = false

    @CommandLine.Option(names = ["-o", "--output-file"], description = ["output File (or empty for stdout)"])
    private var outputFile: File? = null

    @CommandLine.Parameters(arity = "1..*", paramLabel = "FILE", description = ["sourcemonitor csv files"])
    private var files: List<File> = mutableListOf()

    @Throws(IOException::class)
    override fun call(): Void? {

        val csvProjectBuilder = CSVProjectBuilder(pathSeparator, csvDelimiter)
        files.map { it.inputStream() }.forEach<InputStream> { csvProjectBuilder.parseCSVStream(it) }
        val project = csvProjectBuilder.build()
        val filePath = outputFile?.absolutePath ?: "notSpecified"

        if (compress && filePath != "notSpecified") ProjectSerializer.serializeAsCompressedFile(project, filePath) else ProjectSerializer.serializeProject(project, writer())

        return null
    }

    private fun writer(): Writer {
        return if (outputFile == null) {
            OutputStreamWriter(System.out)
        } else {
            BufferedWriter(FileWriter(outputFile))
        }
    }

    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            CommandLine.call(CSVImporter(), System.out, *args)
        }
    }
}
