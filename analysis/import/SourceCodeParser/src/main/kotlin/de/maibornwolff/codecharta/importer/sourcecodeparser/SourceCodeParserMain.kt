package de.maibornwolff.codecharta.importer.sourcecodeparser

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricTable
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagged.TaggableFile
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.infrastructure.antlr.java.Antlr
import de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application.SourceCodeParserEntryPoint
import de.maibornwolff.codecharta.importer.sourcecodeparser.integration.infrastructure.FileSystemSingleSourceProvider
import de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application.TableStreamPrinter
import de.maibornwolff.codecharta.importer.sourcecodeparser.integration.infrastructure.FileSystemMultiSourceProvider
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics.OopLanguage
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics.OopMetricStrategy
import picocli.CommandLine.*
import java.io.*
import java.nio.file.Files
import java.nio.file.Paths
import java.util.concurrent.Callable

@Command(name = "parse", description = ["generates cc.JSON from source code"], footer = ["Copyright(c) 2018, MaibornWolff GmbH"])
class SourceCodeParserMain(private val outputStream: PrintStream) : Callable<Void> {

    @Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @Option(names = ["-p", "--projectName"], description = ["project name"])
    private var projectName = "SourceCodeParserMain"

    @Option(names = ["-out", "--outputType"], description = ["the format to output"], converter = [(OutputTypeConverter::class)])
    private var outputType = OutputType.JSON

    @Option(names = ["--pathSeparator"], description = ["path separator (default = '/')"])
    private var pathSeparator = '/'

    @Option(names = ["-o", "--outputFile"], description = ["output File (or empty for stdout)"])
    private var outputFile: File? = null

    @Parameters(arity = "1..*", paramLabel = "FOLDER or FILEs", description = ["single code folder or files"])
    private var files: List<File> = mutableListOf()

    @Throws(IOException::class)
    override fun call(): Void? {

        if(!files[0].exists()){
            val path = Paths.get("").toAbsolutePath().toString()
            outputStream.println("TaggableFile Parser working directory = $path")
            outputStream.println("Could not find "+files[0])
            return null
        }

        val printer = TableStreamPrinter(outputStream)
        val sourceApp = SourceCodeParserEntryPoint(printer)

        if(files.size == 1 && files[0].isFile) {
            sourceApp.printMetrics(FileSystemSingleSourceProvider(files[0]))
        } else {
            sourceApp.printMetrics(FileSystemMultiSourceProvider(files))
        }

        return null
    }

    private fun parseFile(absolutePath: String): MetricTable {
        val sourceCode = TaggableFile(OopLanguage.JAVA, Files.readAllLines(Paths.get(absolutePath)))
        Antlr.addTagsToSource(sourceCode)
        return MetricTable(sourceCode, OopMetricStrategy())
    }

    private fun parseFolder(absolutePath: String): List<MetricTable>{
        return File(absolutePath).walk()
                .filter { it.isFile && it.extension == "java" }
                .map { parseFile(it.absolutePath) }.toList()
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
            mainWithOutputStream(System.out, args)
        }

        @JvmStatic
        fun mainWithOutputStream(outputStream: PrintStream, args: Array<String>) {
            call(SourceCodeParserMain(outputStream), System.out, *args)
        }
    }
}

