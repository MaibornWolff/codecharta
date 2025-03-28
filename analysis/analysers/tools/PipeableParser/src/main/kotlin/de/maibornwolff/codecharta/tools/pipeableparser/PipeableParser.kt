package de.maibornwolff.codecharta.tools.pipeableparser

interface PipeableParser {
    fun logPipeableParserSyncSignal(syncSignal: PipeableParserSyncFlag) {
        print(syncSignal.value)
    }
}
