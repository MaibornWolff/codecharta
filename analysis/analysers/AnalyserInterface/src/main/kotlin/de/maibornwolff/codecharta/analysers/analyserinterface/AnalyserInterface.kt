package de.maibornwolff.codecharta.analysers.analyserinterface

import java.util.concurrent.Callable

interface AnalyserInterface : Callable<Unit?> {
    val name: String
    val description: String

    fun getDialog(): AnalyserDialogInterface

    fun isApplicable(resourceToBeParsed: String): Boolean

    fun getAnalyserName(): String {
        return name
    }

    fun getAnalyserDescription(): String {
        return description
    }
}
