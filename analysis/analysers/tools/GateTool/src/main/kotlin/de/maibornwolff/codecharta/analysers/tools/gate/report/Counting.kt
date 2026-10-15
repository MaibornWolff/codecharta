package de.maibornwolff.codecharta.analysers.tools.gate.report

fun counted(count: Int, noun: String): String = if (count == 1) "1 $noun" else "$count ${noun}s"
