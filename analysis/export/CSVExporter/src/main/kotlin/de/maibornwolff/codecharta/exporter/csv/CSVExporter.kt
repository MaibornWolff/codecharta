package de.maibornwolff.codecharta.exporter.csv

import picocli.CommandLine
import java.io.FileInputStream
import java.io.FileNotFoundException
import java.io.IOException
import java.io.InputStream
import java.util.*
import java.util.concurrent.Callable

@CommandLine.Command(
        name = "csvexport",
        description = ["generates csv file with header"],
        footer = ["Copyright(c) 2018, MaibornWolff GmbH"]
)
class CSVExporter : Callable<Void> {

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Parameters(arity = "1..*", paramLabel = "FILE", description = ["json files"])
    private var infiles = ArrayList<String>()

    @CommandLine.Option(names = ["-o", "--outputFile"], description = ["output File (or empty for stdout)"])
    private var outputFile = ""

    @Throws(IOException::class)
    override fun call(): Void? {

        return null
    }

    private fun getInputStreamsFromArgs(files: List<String>): List<InputStream> {
        val fileList = files.map { createFileInputStream(it) }
        return if (fileList.isEmpty()) listOf(System.`in`) else fileList
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
            CommandLine.call(CSVExporter(), System.out, *args)
        }
    }
}

