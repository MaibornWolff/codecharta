package de.maibornwolff.codecharta.analysers.tools.gate

import java.io.File

data class GateOptions(val projectFolder: File, val configFile: File?, val parallel: Boolean = false, val mapFile: File? = null)
