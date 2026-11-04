package de.maibornwolff.codecharta.analysers.analyserinterface.scan

import java.io.File

/** What a scan found, both in path order: the files to analyse, and every file and folder the walk let through. */
data class ScannedProject(val sourceFiles: List<File>, val entries: List<File>)
