package de.maibornwolff.codecharta.analysers.tools.validation

import java.io.InputStream

interface Validator {
    fun validate(input: InputStream)
}
