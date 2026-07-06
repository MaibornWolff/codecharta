package de.maibornwolff.codecharta.util

import java.math.BigInteger
import java.security.MessageDigest

/** MD5 helper for the wire-format checksums: 32-char zero-padded lowercase hex. */
object Checksum {
    private const val HEX_RADIX = 16
    private const val MD5_HEX_LENGTH = 32

    fun md5(input: String): String = hex(MessageDigest.getInstance("MD5").digest(input.toByteArray()))

    /** Formats a raw digest as the 32-char zero-padded lowercase hex used on the wire. */
    fun hex(digest: ByteArray): String = BigInteger(1, digest).toString(HEX_RADIX).padStart(MD5_HEX_LENGTH, '0')
}
