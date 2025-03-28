package de.maibornwolff.codecharta.analysers.tools.pipeableparser

interface PipeableParser {
    fun logPipeableParserSyncSignal(syncSignal: PipeableParserSyncFlag) {
        print(syncSignal.value)
    }
}
