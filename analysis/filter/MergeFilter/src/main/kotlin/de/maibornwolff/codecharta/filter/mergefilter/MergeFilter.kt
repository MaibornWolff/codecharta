package de.maibornwolff.codecharta.filter.mergefilter

import com.xenomachina.argparser.ArgParser
import com.xenomachina.argparser.SystemExitException
import com.xenomachina.argparser.default
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import java.io.File
import java.io.FileInputStream
import java.io.InputStream
import java.io.InputStreamReader

enum class Mode {
    RECURSIVE, LEAF
}

class MergeFilterArgs(parser: ArgParser) {
    val sources by parser.positionalList("json files to merge", 1..Int.MAX_VALUE) { File(this) }
    val strategy by parser.mapping(
            "--leaf" to Mode.LEAF,
            "--recursive" to Mode.RECURSIVE,
            help = "merging strategy").default(Mode.RECURSIVE)
    val addMissingNodes by parser.flagging("-a", "--add-missing", help = "enable adding missing nodes to reference")
}

fun main(args: Array<String>) {
    val filterArgs = MergeFilterArgs(ArgParser(args))

    try {
        val inputStream = createInputStreams(filterArgs.sources)
        val projects = inputStream.map { p -> ProjectDeserializer.deserializeProject(InputStreamReader(p)) }

        val nodeMergerStrategy = createNodeMergerStrategy(filterArgs.strategy, filterArgs.addMissingNodes)
        val project = ProjectMerger(projects, nodeMergerStrategy).merge()

        System.out.writer().use { ProjectSerializer.serializeProject(project, it) }

    } catch (e: SystemExitException) {
        System.err.writer().use { e.printUserMessage(it, "merge", 80) }
    }
}

fun createNodeMergerStrategy(mode: Mode, addMissingNodes: Boolean): NodeMergerStrategy {
    return when (mode) {
        Mode.LEAF -> LeafNodeMergerStrategy(addMissingNodes)
        Mode.RECURSIVE -> RecursiveNodeMergerStrategy()
    }
}

private fun createInputStreams(args: List<File>): List<InputStream> {
    return args.map { FileInputStream(it.absoluteFile) }
}

