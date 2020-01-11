package de.maibornwolff.codecharta.importer.rawtextparser.model

fun Boolean.toInt() = if (this) 1 else 0
fun Int.toBool() = this == 1