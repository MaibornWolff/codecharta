package de.maibornwolff.codecharta.model

object PathFactory {
    fun fromFileSystemPath(path: String, pathSeparator: Char = '/'): Path {
        return Path(
            path.split(pathSeparator).dropLastWhile {
                it.isEmpty()
            }.filter {
                it.isNotEmpty()
            }
        )
    }

    fun extractOSIndependentPath(path: String): Path {
        if (path.contains("/") && path.contains("\\")) {
            println("Both slash and backslash was found in path $path. Assumed this to be a unix path.")
            return fromFileSystemPath(path, '/')
        }
        if (path.contains("\\")) {
            return fromFileSystemPath(path, '\\')
        } else {
            return fromFileSystemPath(path, '/')
        }
    }
}
