package de.maibornwolff.codecharta.analysers.tools.multicommit

import de.maibornwolff.codecharta.util.Logger
import picocli.CommandLine
import java.io.File

class ParserExecutor(private val commandLine: CommandLine) {

    fun executeParser(
        parserString: String,
        commitSha: String,
        baseOutputFilename: String?
    ): Int {
        val splitArgs = splitParserArgs(parserString)
        val parserName = splitArgs.first()
        val parserArgs = splitArgs.drop(1).toMutableList()

        validateParserExists(parserName)

        removeOutputFlagIfPresent(parserArgs)

        if (baseOutputFilename != null) injectOutputParameter(parserArgs, commitSha, baseOutputFilename)

        Logger.info { "Executing $parserName for commit $commitSha..." }

        return invokeParser(parserName, parserArgs)
    }

    internal fun splitParserArgs(parserString: String): List<String> { //TODO: simplify function
        val args = mutableListOf<String>()
        val currentArg = StringBuilder()
        var inQuotes = false
        var quoteChar: Char? = null
        var escaped = false

        for (char in parserString) {
            when {
                escaped -> {
                    currentArg.append(char)
                    escaped = false
                }
                char == '\\' -> escaped = true
                char == '"' || char == '\'' -> {
                    if (!inQuotes) {
                        inQuotes = true
                        quoteChar = char
                    } else if (char == quoteChar) {
                        inQuotes = false
                        quoteChar = null
                    } else {
                        currentArg.append(char)
                    }
                }
                char.isWhitespace() && !inQuotes -> {
                    if (currentArg.isNotEmpty()) {
                        args.add(currentArg.toString())
                        currentArg.clear()
                    }
                }
                else -> currentArg.append(char)
            }
        }

        if (currentArg.isNotEmpty()) {
            args.add(currentArg.toString())
        }

        if (args.isEmpty()) {
            throw ParserExecutionException("Parser string cannot be empty")
        }

        return args
    }

    private fun validateParserExists(parserName: String) {
        val subcommands = commandLine.subcommands
        if (!subcommands.containsKey(parserName)) {
            throw ParserExecutionException(
                "Parser '$parserName' not found. Available parsers: " +
                    subcommands.keys.filter { it.endsWith("parser") }.joinToString(", ")
            )
        }
    }

    internal fun removeOutputFlagIfPresent(args: MutableList<String>) {
        val outputFlagWarning = "Warning: --output flag in parser string will be ignored. Use --output at multicommit level instead."

        var removeNextArg = false
        args.removeAll { arg ->
            when {
                removeNextArg -> {
                    removeNextArg = false
                    true
                }
                arg == "--output" || arg == "-o" -> {
                    Logger.warn { outputFlagWarning }
                    removeNextArg = true
                    true
                }
                arg.startsWith("--output=") -> {
                    Logger.warn { outputFlagWarning }
                    true
                }
                else -> false
            }
        }
    }

    internal fun injectOutputParameter(args: MutableList<String>, commitSha: String, baseOutputFilename: String) {
        val outputFile = File(baseOutputFilename)
        val filenameWithExtension = if (outputFile.name.endsWith(".cc.json")) {
            outputFile.name
        } else {
            "${outputFile.name}.cc.json"
        }

        val prefixedFilename = "${commitSha}_$filenameWithExtension"
        val fullOutputPath = outputFile.parent?.let { File(it, prefixedFilename).path } ?: prefixedFilename

        args.add("--output")
        args.add(fullOutputPath)
    }

    private fun invokeParser(parserName: String, args: List<String>): Int {
        return try {
            commandLine.execute(*args.toTypedArray())
        } catch (e: Exception) {
            throw ParserExecutionException("Failed to execute parser '$parserName': ${e.message}", e)
        }
    }
}
