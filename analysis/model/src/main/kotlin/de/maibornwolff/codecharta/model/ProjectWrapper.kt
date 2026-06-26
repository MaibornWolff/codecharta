package de.maibornwolff.codecharta.model

import de.maibornwolff.codecharta.util.Checksum

class ProjectWrapper(
    val data: Project,
    @Transient val projectJson: String
) {
    private val checksum: String = Checksum.md5(projectJson)

    override fun toString(): String = "ProjectWrapper{checksum=$checksum, data=$data}"
}
