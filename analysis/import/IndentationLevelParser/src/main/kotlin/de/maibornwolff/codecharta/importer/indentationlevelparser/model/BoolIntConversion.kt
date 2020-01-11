package de.maibornwolff.codecharta.importer.indentationlevelparser.model

fun Boolean.toInt() = if (this) 1 else 0
fun Int.toBool() = this == 1