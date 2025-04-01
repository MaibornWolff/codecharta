package de.maibornwolff.codecharta.analysers.pipeableanalyserinterface

interface PipeableAnalyserInterface {
    fun logPipeableAnalyserSyncSignal(syncSignal: PipeableAnalyserSyncFlag) {
        print(syncSignal.value)
    }
}
