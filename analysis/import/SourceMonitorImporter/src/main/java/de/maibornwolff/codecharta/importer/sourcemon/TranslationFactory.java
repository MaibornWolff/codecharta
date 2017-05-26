package de.maibornwolff.codecharta.importer.sourcemon;

import java.util.HashMap;
import java.util.Map;

/**
 * Builds metric translation map instances for this project
 */
public class TranslationFactory {

    /**
     * Builds a metric translation map for this project
     * @return a translation map for the metrics
     */
    public static Map<String, String> buildTranslationMap() {

        Map<String, String> translationMap = new HashMap<>();

        translationMap.put("Classes and Interfaces","classes");
        translationMap.put("Maximum Block Depth","max_block_depth");
        translationMap.put("Average Block Depth","average_block_depth");
        translationMap.put("Average Complexity*","average_function_mcc");
        translationMap.put("Maximum Complexity*","max_function_mcc");
        translationMap.put("Methods per Class","functions_per_class");
        translationMap.put("Average Statements per Method","average_statements_per_function");
        translationMap.put("Lines","loc");

        for(int i = 0;i<10; i++) {
            translationMap.put("Statements at block level "+i,"statements_at_"+i);
        }

        return translationMap;

    }

}
