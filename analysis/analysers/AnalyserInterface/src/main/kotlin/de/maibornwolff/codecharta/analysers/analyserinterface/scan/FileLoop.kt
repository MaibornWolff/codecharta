package de.maibornwolff.codecharta.analysers.analyserinterface.scan

import java.io.File

/**
 * Runs the work a parser does on each of its files in place of the parser's own threads, so ccsh analyse -p can do the
 * work of several parsers on one file together. The results keep the order of the files.
 */
interface FileLoop {
    fun <R> map(files: List<File>, work: (File) -> R): List<R>
}
