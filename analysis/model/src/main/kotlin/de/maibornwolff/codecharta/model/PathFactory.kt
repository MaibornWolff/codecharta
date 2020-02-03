package de.maibornwolff.codecharta.model

object PathFactory {

    fun fromFileSystemPath(path: String, pathSeparator: Char = '/'): Path {
        return Path(path.split(pathSeparator)
                .dropLastWhile { it.isEmpty() }
                .filter { !it.isEmpty() })
    }
}
