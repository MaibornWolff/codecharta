package de.maibornwolff.codecharta.serialization

import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.dto.CcJson15Project
import de.maibornwolff.codecharta.serialization.dto.CcJson15Wrapper
import java.math.BigInteger
import java.security.MessageDigest

/**
 * Maps the lens-native domain [Project] onto the legacy 1.5 wire DTO and computes the wrapper
 * checksum (MD5 over the serialized `data`), reproducing the historical 1.5 output exactly.
 */
object ProjectToCcJson15Mapper {
    fun toWrapper(project: Project): CcJson15Wrapper {
        val data =
            CcJson15Project(
                projectName = project.projectName,
                nodes = listOf(project.rootNode),
                apiVersion = project.apiVersion,
                edges = project.edges,
                attributeTypes = project.attributeTypes,
                attributeDescriptors = project.attributeDescriptors,
                blacklist = project.blacklist
            )
        val dataJson = CcJson15Gson.gson.toJson(data)
        return CcJson15Wrapper(md5(dataJson), data)
    }

    private fun md5(input: String): String {
        val digest = MessageDigest.getInstance("MD5").digest(input.toByteArray())
        return BigInteger(1, digest).toString(16).padStart(32, '0')
    }
}
