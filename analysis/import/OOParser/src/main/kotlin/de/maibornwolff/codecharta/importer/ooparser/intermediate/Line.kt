package de.maibornwolff.codecharta.importer.ooparser.intermediate

import de.maibornwolff.codecharta.importer.ooparser.antlrinterop.Tags
import de.maibornwolff.codecharta.importer.ooparser.extract.Row
import kotlin.collections.ArrayList

public class Line(val lineNumber:Int, text: String) {

    private val text: String = text
    private val tags = ArrayList<Tags>()

    fun addTag(tag: Tags) {
        this.tags.add(tag)
    }

    fun tags(): Collection<Tags>{
        return tags
    }

    fun text() = text

    companion object{
        val NULL = Line(0, "")
    }

}