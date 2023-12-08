package de.maibornwolff.codecharta.util

import picocli.CommandLine
import java.util.Stack

class CommaSeparatedParameterPreprocessor: CommandLine.IParameterPreprocessor {
    override fun preprocess(args: Stack<String>?, commandSpec: CommandLine.Model.CommandSpec?, argSpec: CommandLine.Model.ArgSpec?, info: MutableMap<String, Any>?): Boolean {
        if (args == null) return false

        var argsList = ""
        while (args.peek() != null) {
            val currentArg = args.pop()
            argsList += currentArg
            if (!currentArg.matches(Regex(".*,\\s*$"))) {
                break
            }
        }
        args.push(argsList)
        return false
    }
}
