package de.maibornwolff.codecharta.util

import picocli.CommandLine
import java.util.Stack

class CommaSeparatedParameterPreprocessor : CommandLine.IParameterPreprocessor {
    override fun preprocess(
        args: Stack<String>?,
        commandSpec: CommandLine.Model.CommandSpec?,
        argSpec: CommandLine.Model.ArgSpec?,
        info: MutableMap<String, Any>?
    ): Boolean {
        if (args.isNullOrEmpty()) return false

        val stringBuilder = StringBuilder()
        while (args.peek() != null) {
            val arg = args.pop()
            stringBuilder.append(arg)
            if (!arg.matches(Regex(".*,\\s*$"))) {
                break
            }
        }

        args.push(stringBuilder.toString())
        return false
    }
}
