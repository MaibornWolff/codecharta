package de.maibornwolff.codecharta.serialization

import com.google.gson.GsonBuilder
import de.maibornwolff.codecharta.model.Project
import java.io.*
import java.nio.charset.StandardCharsets.UTF_8
import java.util.zip.GZIPInputStream
import java.util.zip.GZIPOutputStream


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
        out.close()

    }

    /**
     * This method serializes a Project-Object to json and compresses it to gzip
     *
     * @param project the Project-Object to be serialized
     * @param absolutePath the path of the compressed file
     */

    fun serializeAsCompressedFile(project: Project, absolutePath: String){
        val jsonFile:String = GSON.toJson(project, Project::class.java)
        File("$absolutePath.gz").writeBytes(compress(jsonFile))
    }

    /**
     * This method compresses a string to gzip
     *
     * @param toCompress the string to be compressed
     * @param
     */
    fun compress(toCompress: String): ByteArray {
        val byteStream = ByteArrayOutputStream()
        GZIPOutputStream(byteStream).bufferedWriter(UTF_8).use { it.write(toCompress) }
        return byteStream.toByteArray()
    }

    /**
     * This method serializes a Project-Object to json and compresses it to gzip and deletes the writer-File
     *
     * @param project the project to be compressed
     * @param filePath the path to the writer generated empty file
     * @param out the writer
     */
     fun serializeCompressedFileAndDeleteJsonFile(project: Project, filePath: String,out: Writer){
        out.close()
        serializeAsCompressedFile(project, filePath)
        File(filePath).delete()

    }

}
