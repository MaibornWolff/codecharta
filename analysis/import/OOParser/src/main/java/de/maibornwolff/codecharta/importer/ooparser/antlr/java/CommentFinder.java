package de.maibornwolff.codecharta.importer.ooparser.antlr.java;

import de.maibornwolff.codecharta.importer.ooparser.antlrinterop.NonCodeTags;
import de.maibornwolff.codecharta.importer.ooparser.antlrinterop.Source;
import org.antlr.v4.runtime.CommonTokenStream;
import org.antlr.v4.runtime.Token;

public class CommentFinder {

    private Source source;

    public CommentFinder(Source source){
        this.source = source;
    }

    public void extractComments(CommonTokenStream tokens){
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
