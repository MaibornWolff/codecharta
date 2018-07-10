package de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagged

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