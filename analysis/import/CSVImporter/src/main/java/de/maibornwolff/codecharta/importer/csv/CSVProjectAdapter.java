/*
 * Copyright (c) 2017, MaibornWolff GmbH
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *  * Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *  * Neither the name of  nor the names of its contributors may be used to
 *    endorse or promote products derived from this software without specific
 *    prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

package de.maibornwolff.codecharta.importer.csv;

import com.univocity.parsers.csv.CsvParser;
import com.univocity.parsers.csv.CsvParserSettings;
import de.maibornwolff.codecharta.model.PathFactory;
import de.maibornwolff.codecharta.model.Node;
import de.maibornwolff.codecharta.model.NodeType;
import de.maibornwolff.codecharta.model.Project;
import de.maibornwolff.codecharta.nodeinserter.NodeInserter;
import de.maibornwolff.codecharta.translator.MetricNameTranslator;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

public class CSVProjectAdapter extends Project {
    public static final String ROOT = "root";
    private final char pathSeparator;
    private final char csvDelimiter;

    private CSVHeader header;

    public CSVProjectAdapter(String projectName, char pathSeparator, char csvDelimiter) {
        super(projectName);
        this.pathSeparator = pathSeparator;
        this.csvDelimiter = csvDelimiter;
        this.getNodes().add(new Node(ROOT, NodeType.Folder));
    }

    public void addProjectFromCsv(InputStream inStream) {
        addProjectFromCsv(inStream, MetricNameTranslator.TRIVIAL);
    }

    public void addProjectFromCsv(InputStream inStream, MetricNameTranslator metricNameTranslator) {
        CsvParser parser = createParser(inStream);
        String[] oldHeader = parser.parseNext();
        header = new CSVHeader(metricNameTranslator.translate(oldHeader));
        parseContent(parser);
        parser.stopParsing();
    }

    private void parseContent(CsvParser parser) {
        String[] row;
        while ((row = parser.parseNext()) != null) {
            insertNodeForRow(row);
        }
    }

    private CsvParser createParser(InputStream inStream) {
        CsvParserSettings parserSettings = new CsvParserSettings();
        parserSettings.getFormat().setDelimiter(csvDelimiter);

        CsvParser parser = new CsvParser(parserSettings);
        parser.beginParsing(new InputStreamReader(inStream, StandardCharsets.UTF_8));
        return parser;
    }

    private void insertNodeForRow(String[] rawRow) {
        try {
            CSVRow row = new CSVRow(rawRow, header, pathSeparator);
            Node node = new Node(row.getFileName(), NodeType.File, row.getAttributes());
            NodeInserter.insertByPath(this, PathFactory.fromFileSystemPath(row.getFolderWithFile().replace(pathSeparator, '/')), node);
        } catch (IllegalArgumentException e) {
            System.err.println("Ignoring " + e.getMessage());
        }
    }


}
