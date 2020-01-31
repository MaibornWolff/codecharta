package de.maibornwolff.codecharta.tools.validation

import java.io.InputStream

interface Validator {
    fun validate(input: InputStream)
}