package de.maibornwolff.codecharta.model

import com.appmattus.crypto.Algorithm

class ChecksumCalculator {
    companion object {
        fun calculateChecksum(fileContent: String): String? {
            if (fileContent.isEmpty()) {
                return null
            }
            val hash = Algorithm.XXHash64().hash(fileContent.toByteArray())
            return convertToHexString(hash)
        }

        private fun convertToHexString(bytes: ByteArray): String {
            // Convert each byte to a 2-character hexadecimal string (e.g. byte value 255 becomes ff)
            val hexChars = bytes.map { byte ->
                val hexValue = byte.toInt() and 0xFF // Convert to unsigned integer in range 0-255
                hexValue.toString(16).padStart(2, '0') // Convert to hex and pad with zero if needed
            }
            return hexChars.joinToString("")
        }
    }
}
