package de.maibornwolff.codecharta.analysers.importers.sonar.model

data class ErrorResponse(val errors: Array<ErrorEntity>) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as ErrorResponse

        if (!errors.contentEquals(other.errors)) return false

        return true
    }

    override fun hashCode(): Int {
        return errors.contentHashCode()
    }

    override fun toString(): String {
        return "ErrorResponse(errors=${errors.contentToString()})"
    }
}
