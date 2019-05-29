package de.maibornwolff.codecharta.filter.structurechanger

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

    @CommandLine.Parameters(arity = "1..*", paramLabel = "FILE or FOLDER", description = ["files to merge"])
    private var sources: Array<File> = arrayOf()


    private val logger = KotlinLogging.logger {}

    override fun call(): Void? {

        return null
    }

    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            CommandLine.call(StructureChanger(), System.out, *args)
        }
    }
}
