package de.maibornwolff.codecharta.serialization

import com.google.gson.GsonBuilder
import de.maibornwolff.codecharta.model.Project

import java.io.BufferedWriter
import java.io.FileWriter
import java.io.IOException
import java.io.Writer

/**
 * This class provides static methods and functions to convert a Project-Object to json
 */
object ProjectSerializer {

    private val GSON = GsonBuilder().create()

    /**
     * This method serializes a Project-Object to json and writes it into the specified file.
     *
     * @param project    the Project-Object to be serialized
     * @param targetPath the path of the output-file
     */
    @Throws(IOException::class)
    fun serializeProjectAndWriteToFile(project: Project, targetPath: String) {

        try {
            BufferedWriter(FileWriter(targetPath)).use { serializeProject(project, it) }
        } catch (e: IOException) {
            throw IOException("There was an Error while writing the file at $targetPath", e)
        }
    }

    /**
     * This method serializes a Project-Object to json and writes using given writer
     *
     * @param project the Project-Object to be serialized
     * @param out     writer to write serialized object
     */
    @Throws(IOException::class)
    fun serializeProject(project: Project, out: Writer) {
        GSON.toJson(project, Project::class.java, out)
        out.flush()
    }
}
