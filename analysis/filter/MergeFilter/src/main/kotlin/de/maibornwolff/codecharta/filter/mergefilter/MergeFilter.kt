package de.maibornwolff.codecharta.filter.mergefilter

import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import java.io.*
import kotlin.system.exitProcess

fun main(args: Array<String>) {
    if (args.isEmpty()) {
        print("Wrong number of parameters " + args.size)
        printUsage()
        exitProcess(1)
    }
    val inputStream = getInputFromArgs(args)
    val projects = inputStream.map { p -> ProjectDeserializer.deserializeProject(InputStreamReader(p)) }
    val project = ProjectMerger(projects).merge()
    ProjectSerializer.serializeProject(project, PrintWriter(System.out))
}

fun printUsage() {
    print("Usage: ccsh merge <json> <json> ")
}

@Throws(FileNotFoundException::class)
private fun getInputFromArgs(args: Array<String>): List<InputStream> {
    return args.map { a ->
        FileInputStream(File(a).absoluteFile)
    }
}

