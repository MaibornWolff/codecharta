package de.maibornwolff.codecharta.filter.mergefilter

import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import java.io.*

fun main(args: Array<String>) {
    if (args.size <= 1) {
        print("Wrong number of parameters " + args.size)
        printUsage()
    }
    val inputStream = getInputFromArgs(args)
    val projects = inputStream.map { p -> ProjectDeserializer.deserializeProject(InputStreamReader(p)) }
    val project = ProjectMerger(projects).merge()
    ProjectSerializer.serializeProject(project, PrintWriter(System.out))
}

fun printUsage() {
    print("Usage: MergeFilter.exe <json> <json> ")
}

@Throws(FileNotFoundException::class)
private fun getInputFromArgs(args: Array<String>): List<InputStream> {
    return when (args.size) {
        0 -> throw UnsupportedOperationException("At least two inputs must be provided.")
        else -> args.map { a -> FileInputStream(File(a).absoluteFile) }
    }
}

