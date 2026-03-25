package de.maibornwolff.codecharta.analysers.tools.validation

import java.io.InputStream

fun interface Validator {
    fun validate(input: InputStream)
}
