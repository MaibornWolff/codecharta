package de.maibornwolff.codecharta.ccsh.parser

import picocli.CommandLine.Command
import java.util.concurrent.Callable

@Command(
    subcommands = [TestSelectedParser::class],
    hidden = true
)
class NotInteractiveParserTest : Callable<Unit?> {
    override fun call(): Unit? {
        return null
    }
}

@Command(
    name = "selectedParser",
    hidden = true
)
class TestSelectedParser {
}
