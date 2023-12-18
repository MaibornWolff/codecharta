package de.maibornwolff.codecharta.filter.structuremodifier

import mu.KotlinLogging
import picocli.CommandLine
import java.util.*

class ExtractFirstOptionPreprocessor : CommandLine.IParameterPreprocessor {

    private val logger = KotlinLogging.logger {}

    override fun preprocess(args: Stack<String>?, commandSpec: CommandLine.Model.CommandSpec?, argSpec: CommandLine.Model.ArgSpec?, info: MutableMap<String, Any>?): Boolean {
        if (args.isNullOrEmpty()) return false

        val removedArgs = mutableListOf<String>()
        val keptArgs = Stack<String>()
        while (args.isNotEmpty() && args.peek() != null) {
            val arg = args.pop()
            if (arg.startsWith("-o") || !arg.startsWith("-")) {
                keptArgs.push(arg)
            }
            else {
                removedArgs.add(arg)
            }
        }

        logger.warn("More than one option specified, ignoring: '${removedArgs.joinToString(",")}'")

        while (keptArgs.isNotEmpty()) {
            args.push(keptArgs.pop())
        }
        return false
    }
}
