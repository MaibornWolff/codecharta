package de.maibornwolff.codecharta.importer.ooparser

import de.maibornwolff.codecharta.importer.ooparser.antlr.java.JavaLexer
import de.maibornwolff.codecharta.importer.ooparser.antlr.java.JavaParser
import org.antlr.v4.runtime.CharStream
import picocli.CommandLine
import java.io.*
import java.util.concurrent.Callable
import org.antlr.v4.runtime.CharStreams
import org.antlr.v4.runtime.CommonTokenStream
import org.antlr.v4.runtime.tree.ParseTree

@CommandLine.Command(name = "parse", description = ["generates cc.json from projectpath"], footer = ["Copyright(c) 2018, MaibornWolff GmbH"])
class OOParserMain : Callable<Void> {

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Option(names = ["-p", "--projectName"], description = ["project name"])
    private var projectName = "OOParserMain"

    @CommandLine.Option(names = ["--pathSeparator"], description = ["path separator (default = '/')"])
    private var pathSeparator = '/'

    @CommandLine.Option(names = ["-o", "--outputFile"], description = ["output File (or empty for stdout)"])
    private var outputFile: File? = null

    @CommandLine.Parameters(arity = "1..*", paramLabel = "FILE", description = ["project file"])
    private var files: List<File> = mutableListOf()

    @Throws(IOException::class)
    override fun call(): Void? {

        /*val file =  files.get(0)
        print(file)*/

        val filePath = files.get(0).absolutePath
        println(filePath)

        val fileCharStream: CharStream = CharStreams.fromFileName(filePath)
        val lexer = JavaLexer(fileCharStream)
        val tokens = CommonTokenStream(lexer)
        val parser = JavaParser(tokens)

        println("--------------------")
        parse(parser.compilationUnit())

        println("--------------------")
        System.out.println(parser.compilationUnit().toStringTree())

        println("--------------------")
        System.out.println(parser.compilationUnit().start.getLine())


        return null
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
            CommandLine.call(OOParserMain(), System.out, *args)
        }
    }
}

