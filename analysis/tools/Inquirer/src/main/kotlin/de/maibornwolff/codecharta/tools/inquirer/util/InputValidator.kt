package de.maibornwolff.codecharta.tools.inquirer.util

class InputValidator {

    companion object {

        //TODO what kind of methods do we need here?
        // -> create all that are currently needed for the project when integrating kotter into each parser
        //
        // needed checkers:
        // check if the input is an existing file
        // check if the input is an existing file or folder (can probably be combined with above function)
        // sometimes input is list of files (or folders), check if they are all existing files
        // (add more when going through the parsers)

        fun isInputAnExistingFile(): (String) -> Boolean = { input ->
            true
        }

        fun isInputAnExistingFileOrFolder(): (String) -> Boolean = { input ->
            true
        }

        // not sure if this one is needed, its currently there for testing
        fun isInputBetweenNumbers(minValue: Int, maxValue: Int): (String) -> Boolean = { input ->
            val inputNumber = input.toInt()
            minValue < inputNumber && inputNumber < maxValue
        }
    }

}
