package de.maibornwolff.codecharta.model

import java.math.BigInteger
import java.security.MessageDigest

class ProjectWrapper(
        val data: Project,
        @Transient val projectJson: String,
                    ) {
                    private val checksum: String

    init {
        checksum = md5(projectJson)
    }

    private fun md5(input: String): String {
        val md5Algorithm = MessageDigest.getInstance("MD5")
        return BigInteger(1, md5Algorithm.digest(input.toByteArray())).toString(16).padStart(32, '0')
    }

    override fun toString(): String {
        return "ProjectWrapper{checksum=$checksum, data=$data}"
    }
}
