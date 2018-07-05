package de.maibornwolff.codecharta.importer.sourcecodeparser

import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.core.extract.MetricExtractor
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.core.intermediate.SourceCode
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.infrastructure.antlr.java.Antlr
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.infrastructure.prettyPrint
import org.antlr.v4.runtime.tree.ParseTree
import picocli.CommandLine.*
import java.io.*
import java.nio.file.Files
import java.nio.file.Paths
import java.util.concurrent.Callable

@Command(name = "parse", description = ["generates cc.JSON from source code"], footer = ["Copyright(c) 2018, MaibornWolff GmbH"])
class SourceCodeParserMain : Callable<Void> {

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
            println("SourceCode Parser working directory = $path")
            println("Could not find "+files[0].absolutePath)
            return null
        }

        if(files[0].isFile){
            println(prettyPrint(parseFile(files[0].absolutePath)))
        }else{
            parseFolder(files[0].absolutePath)
        }

        return null
    }

    private fun parseFile(absolutePath: String):MetricExtractor{
        val sourceCode = SourceCode(Files.readAllLines(Paths.get(absolutePath)))
        Antlr.addTagsToSource(sourceCode)
        return MetricExtractor(sourceCode)
    }

    private fun parseFolder(absolutePath: String){
        var javafiles = 0
        var loc = 0
        File(absolutePath).walk().forEach {
            if(it.isFile){
                javafiles++
                loc = parseFile(it.absolutePath).loc()
            }
        }
        println("Language Files LoC")
        println("--------------")
        println("Java       $javafiles   $loc")
        println("--------------")
        println("SUM: 1 1")
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
            call(SourceCodeParserMain(), System.out, *args)
        }
    }
}

