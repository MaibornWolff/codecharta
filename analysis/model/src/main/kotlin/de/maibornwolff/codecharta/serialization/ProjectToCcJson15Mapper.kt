package de.maibornwolff.codecharta.serialization

import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.dto.CcJson15Project
import de.maibornwolff.codecharta.serialization.dto.CcJson15Wrapper
import de.maibornwolff.codecharta.util.Checksum

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
                apiVersion = ApiVersion.ONE_FIVE.versionString,
                edges = project.lenses.dependency.edges,
                attributeTypes = project.lenses.legacyAttributeTypes(),
                attributeDescriptors = project.lenses.allAttributeDescriptors(),
                blacklist = project.blacklist
            )
        val dataJson = CcJson15Gson.gson.toJson(data)
        return CcJson15Wrapper(data, Checksum.md5(dataJson))
    }
}
