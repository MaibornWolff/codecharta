package de.maibornwolff.codecharta.model

object PathFactory {
    fun fromFileSystemPath(path: String, pathSeparator: Char = '/'): Path = Path(
        path
            .split(pathSeparator)
            .dropLastWhile {
                it.isEmpty()
            }.filter {
                it.isNotEmpty()
            }
    )

    fun extractOSIndependentPath(path: String): Path {
        if (path.contains("/") && path.contains("\\")) {
            println("Both slash and backslash was found in path $path. Assumed this to be a unix path.")
            return fromFileSystemPath(path, '/')
        }
        return if (path.contains("\\")) {
            fromFileSystemPath(path, '\\')
        } else {
            fromFileSystemPath(path, '/')
        }
    }
}
