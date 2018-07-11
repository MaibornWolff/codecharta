package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.raw.SourceCode
import de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application.LocationResolver
import de.maibornwolff.codecharta.importer.sourcecodeparser.integration.infrastructure.FileSystemSourceCode
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics.OopLanguage
import kotlin.coroutines.experimental.buildSequence

class EndlessResolver(
        private val total2Real1Count: Int,
        private val total20Real10Count: Int,
        private val total20Real10Mcc1Nl1Count: Int): LocationResolver {

    override fun resolve(locations: List<String>): List<SourceCode> {
        val simpleList = buildSequence {
            while (true) {
                yield(FileSystemSourceCode(OopLanguage.JAVA, total2Real1))
            }
        }.take(total2Real1Count).toList()

        val mediumList = buildSequence {
            while (true) {
                yield(FileSystemSourceCode(OopLanguage.JAVA, total20Real10))
            }
        }.take(total20Real10Count).toList()

        val mccList = buildSequence {
            while (true) {
                yield(FileSystemSourceCode(OopLanguage.JAVA, total20Real10Mcc1Nl1))
            }
        }.take(total20Real10Mcc1Nl1Count).toList()

        return simpleList + mediumList + mccList
    }

    private val total2Real1 =
"""
public class TaggingInterface {
}
""".trim().lines()

    private val total20Real10 =
"""
package none;

import foo;

@Entity
public class Foo {

    @Deprecated("this is bad code")
    private int stuff;

    // constructor
    public Foo(int value){
        stuff = value; // magic number
    }

    public int getStuff(){
        return stuff;
    }
}""".trim().lines()

    private val total20Real10Mcc1Nl1 =
            """
package none;

import foo;

@Entity
public class Foo {

    public int calc(int value){
        if(value > 5){
            return 5;
        }
        return value;
    }

    public int foo(String str){

        return 5;

    }
}""".trim().lines()
}