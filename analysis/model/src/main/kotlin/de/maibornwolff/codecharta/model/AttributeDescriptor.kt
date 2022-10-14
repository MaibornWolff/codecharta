package de.maibornwolff.codecharta.model

class AttributeDescriptor(
    val description: String = "",
    val hintLowValue: String = "",
    val hintHighValue: String = "",
    val link: String = "") {

    override fun toString(): String {
        return "descriptions:$description, hintLowValue:$hintLowValue, hintHighValue:$hintHighValue, link:$link"
    }
}
