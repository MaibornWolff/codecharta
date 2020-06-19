package de.maibornwolff.codecharta.importer.sonar.model

import java.util.Arrays

data class ErrorResponse(val errors: Array<ErrorEntity>) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as ErrorResponse

        if (!Arrays.equals(errors, other.errors)) return false

        return true
    }

    override fun hashCode(): Int {
        return Arrays.hashCode(errors)
    }
}
