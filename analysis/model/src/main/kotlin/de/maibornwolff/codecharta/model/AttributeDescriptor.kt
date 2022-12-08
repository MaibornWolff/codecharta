package de.maibornwolff.codecharta.model

class AttributeDescriptor(
    val title: String = "",
    val description: String = "",
    val hintLowValue: String = "",
    val hintHighValue: String = "",
    val link: String = "") {

    override fun toString(): String {
        return "title:$title, description:$description, hintLowValue:$hintLowValue, hintHighValue:$hintHighValue, link:$link"
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as AttributeDescriptor

        return title == other.title &&
            description == other.description &&
            hintLowValue == other.hintLowValue &&
            hintHighValue == other.hintHighValue &&
            link == other.link
    }

    override fun hashCode(): Int {
        var result = title.hashCode()
        result = 31 * result + description.hashCode()
        result = 31 * result + hintLowValue.hashCode()
        result = 31 * result + hintHighValue.hashCode()
        result = 31 * result + link.hashCode()
        return result
    }
}
