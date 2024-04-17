package de.maibornwolff.codecharta.serialization

enum class FileExtension(
        val extension: String,
                        ) {
                        JSON(".json"),
    CSV(".csv"),
    CODECHARTA(".cc"),
    GZIP(".gz"),
}
