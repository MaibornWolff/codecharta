package de.maibornwolff.codecharta.serialization

import java.io.File
import java.io.FileOutputStream
import java.io.OutputStream

object OutputFileHandler {
    fun stream(outputFilePath: String?, fallbackOutputStream: OutputStream, compressed: Boolean): OutputStream {
        return if (outputFilePath.isNullOrBlank()) {
            fallbackOutputStream
        } else {
            FileOutputStream(File(checkAndFixFileExtension(outputFilePath, compressed, FileExtension.JSON)))
        }
    }

    fun checkAndFixFileExtension(outputName: String, compressed: Boolean, fileExtension: FileExtension): String {
        return when (fileExtension) {
            FileExtension.JSON ->
                outputName.removeSuffix(FileExtension.GZIP.primaryExtension).removeSuffix(FileExtension.JSON.primaryExtension)
                    .removeSuffix(
                        FileExtension.CODECHARTA.primaryExtension
                    ) + FileExtension.CODECHARTA.primaryExtension +
                    FileExtension.JSON.primaryExtension +
                    if (compressed) FileExtension.GZIP.primaryExtension else String()

            FileExtension.CSV -> outputName.removeSuffix(FileExtension.CSV.primaryExtension) + FileExtension.CSV.primaryExtension

            else -> throw IllegalArgumentException()
        }
    }
}
