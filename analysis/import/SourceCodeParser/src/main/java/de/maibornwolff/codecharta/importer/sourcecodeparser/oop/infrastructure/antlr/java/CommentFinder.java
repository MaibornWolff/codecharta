package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.infrastructure.antlr.java;

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagged.TagableSourceCode;
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.tagging.NonCodeTags;
import org.antlr.v4.runtime.CommonTokenStream;
import org.antlr.v4.runtime.Token;

class CommentFinder {

    private TagableSourceCode source;

    CommentFinder(TagableSourceCode source){
        this.source = source;
    }

    void extractComments(CommonTokenStream tokens){
        tokens.fill();
        for (int index = 0; index < tokens.size(); index++) {
            Token token = tokens.get(index);
            String commentLines[] = token.getText().split("\\r?\\n");
            if (token.getChannel() == 2) {
                for(int commentLine = token.getLine(); commentLine < token.getLine() + commentLines.length; commentLine++){
                    source.addTag(commentLine, NonCodeTags.COMMENT);
                }
            }
        }
    }
}
