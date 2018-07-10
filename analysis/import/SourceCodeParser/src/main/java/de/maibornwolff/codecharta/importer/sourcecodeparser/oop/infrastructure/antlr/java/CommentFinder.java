package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.infrastructure.antlr.java;

import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.tagging.NonCodeTags;
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.tagging.SourceFile;
import org.antlr.v4.runtime.CommonTokenStream;
import org.antlr.v4.runtime.Token;

class CommentFinder {

    private SourceFile source;

    CommentFinder(SourceFile source){
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
