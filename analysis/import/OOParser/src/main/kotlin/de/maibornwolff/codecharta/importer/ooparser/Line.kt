package de.maibornwolff.codecharta.importer.ooparser

import javax.print.DocFlavor
import kotlin.collections.ArrayList

class Line(val lineNumber:Int, text: String) {

    private val text: String = text
    private val tags = ArrayList<Tags>()

    fun addTag(tag: Tags) {
        this.tags.add(tag)
    }

    fun tags(): Collection<Tags>{
        return tags
    }

    fun text() = text

}