package de.maibornwolff.codecharta.importer.sourcecodeparser

import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics.RowMetrics
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.tagging.SourceFile
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.infrastructure.antlr.java.Antlr
import de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application.Printer
import de.maibornwolff.codecharta.importer.sourcecodeparser.integration.infrastructure.PrintStreamPrinter
import org.antlr.v4.runtime.tree.ParseTree
import picocli.CommandLine.*
import java.io.*
import java.nio.file.Files
import java.nio.file.Paths
import java.util.concurrent.Callable

@Command(name = "parse", description = ["generates cc.JSON from source code"], footer = ["Copyright(c) 2018, MaibornWolff GmbH"])
class SourceCodeParserMain(private val printer: Printer) : Callable<Void> {

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
            println("SourceFile Parser working directory = $path")
            println("Could not find "+files[0].absolutePath)
            return null
        }

        if(files[0].isFile){
            printer.printFile(parseFile(files[0].absolutePath))
        }else{
            printer.printFolder(parseFolder(files[0].absolutePath))
        }

        return null
    }

    private fun parseFile(absolutePath: String):RowMetrics{
        val sourceCode = SourceFile(Files.readAllLines(Paths.get(absolutePath)))
        Antlr.addTagsToSource(sourceCode)
        return RowMetrics(sourceCode)
    }

    private fun parseFolder(absolutePath: String): List<RowMetrics>{
        return File(absolutePath).walk()
                .filter { it.isFile && it.extension == "java" }
                .map { parseFile(it.absolutePath) }.toList()
    }

    private fun parse(parseTree: ParseTree) {

        if (parseTree.childCount > 1) {
            println(parseTree.text)
        }

        for (i in 0 until parseTree.childCount) {
            parse(parseTree.getChild(i))
        }
    }

    /**
     * Kotlin Example to read contents of file line by line
     */
    fun readFile(file: File) {

        var i: Int = 1

        file.readLines().forEach {
            print((i++))
            println(": "+it)
        }
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
            call(SourceCodeParserMain(PrintStreamPrinter(System.out)), System.out, *args)
        }
    }
}

