package de.maibornwolff.codecharta.serialization

import java.io.InputStream

/**
 * The input of an analyser that ccsh runs itself, which no other command pipes a map into: reading a project from it
 * returns none at once instead of waiting for a pipe to fill.
 */
object NoPipedInput : InputStream() {
    override fun read(): Int = -1
}
