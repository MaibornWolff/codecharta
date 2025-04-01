package de.maibornwolff.codecharta.analysers.pipeableparser

interface PipeableParser {
    fun logPipeableParserSyncSignal(syncSignal: PipeableParserSyncFlag) {
        print(syncSignal.value)
    }
}
