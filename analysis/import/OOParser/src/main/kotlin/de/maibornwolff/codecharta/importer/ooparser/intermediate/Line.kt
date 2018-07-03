package de.maibornwolff.codecharta.importer.ooparser.intermediate

import de.maibornwolff.codecharta.importer.ooparser.antlrinterop.Tags
import kotlin.collections.ArrayList

class Line(val lineNumber:Int, val text: String) {

    private val tags = ArrayList<Tags>()

    fun addTag(tag: Tags) {
        this.tags.add(tag)
    }

    fun tags(): Collection<Tags>{
        return tags
    }

    companion object{
        val NULL = Line(0, "")
    }

}