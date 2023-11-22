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
            FileExtension.JSON -> outputName
                    .removeSuffix(FileExtension.GZIP.extension)
                    .removeSuffix(FileExtension.JSON.extension)
                    .removeSuffix(FileExtension.CODECHARTA.extension) +
                                  FileExtension.CODECHARTA.extension +
                                  FileExtension.JSON.extension +
                                  if (compressed) FileExtension.GZIP.extension else String()
            FileExtension.CSV -> outputName
                    .removeSuffix(FileExtension.CSV.extension) +
                                 FileExtension.CSV.extension
            else -> throw IllegalArgumentException()
        }
    }
}
