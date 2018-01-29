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

package de.maibornwolff.codecharta.importer.sonar;

import com.google.common.collect.ImmutableMap;
import de.maibornwolff.codecharta.importer.sonar.model.Qualifier;
import de.maibornwolff.codecharta.importer.sonar.model.Scope;
import de.maibornwolff.codecharta.importer.sonar.model.SonarAttribute;
import de.maibornwolff.codecharta.importer.sonar.model.SonarResource;

import javax.xml.stream.XMLEventReader;
import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.events.StartElement;
import javax.xml.stream.events.XMLEvent;
import java.io.Reader;
import java.util.*;


class SonarResourceReader {

    // names of tags in sonar xml
    private static final String RESOURCE_TAG = "resource";
    private static final String MSR_TAG = "msr";
    private static final String KEY_TAG = "key";
    private static final String VAL_TAG = "val";
    private static final String NAME_TAG = "name";
    private static final String LNAME_TAG = "lname";
    private static final String SCOPE_TAG = "scope";
    private static final String QUALIFIER_TAG = "qualifier";

    private final List<SonarResource> parsedSonarResources = new ArrayList<>();
    private final XMLEventReader eventReader;

    public SonarResourceReader(Reader reader) {
        try {
            XMLInputFactory factory = XMLInputFactory.newInstance();
            eventReader = factory.createXMLEventReader(reader);
        } catch (XMLStreamException e) {
            throw new SonarImporterException("Could not create XMLParser", e);
        }
    }

    public List<SonarResource> readSonarResources() {
        while (eventReader.hasNext()) {
            XMLEvent event = getNextEventOrThrowException();
            if (isResourceStartTag(event)) {
                parseResource().ifPresent(parsedSonarResources::add);
            }
        }
        return parsedSonarResources;
    }

    private boolean isResourceStartTag(XMLEvent event) {
        return event.isStartElement() && event.asStartElement().getName().getLocalPart().equals(RESOURCE_TAG);
    }

    private XMLEvent getNextEventOrThrowException() {
        try {
            return eventReader.nextEvent();
        } catch (XMLStreamException e) {
            throw new SonarImporterException(e);
        }
    }

    private Optional<SonarResource> parseResource() {
        Map<String, String> attributes = new HashMap<>();
        List<SonarAttribute> metrics = new ArrayList<>();
        while (eventReader.hasNext()) {
            XMLEvent event = getNextEventOrThrowException();
            if (isMetricStartTag(event)) {
                parseMetric().ifPresent(metrics::add);
            } else if (isResourceEndTag(event)) {
                break;
            } else if (event.isStartElement()) {
                attributes.putAll(parseAttribute(event.asStartElement()));
            }
        }
        return Optional.of(createResource(attributes, metrics));
    }

    private boolean isResourceEndTag(XMLEvent event) {
        return event.isEndElement() && event.asEndElement().getName().getLocalPart().equals(RESOURCE_TAG);
    }

    private boolean isMetricStartTag(XMLEvent event) {
        return event.isStartElement() && event.asStartElement().getName().getLocalPart().equals(MSR_TAG);
    }


    private Optional<SonarAttribute> parseMetric() {
        Map<String, String> attributes = new HashMap<>();
        while (eventReader.hasNext()) {
            XMLEvent event = getNextEventOrThrowException();
            if (event.isStartElement()) {
                attributes.putAll(parseAttribute(event.asStartElement()));
            } else if (event.isEndElement()) {
                break;
            }
        }

        if (attributes.containsKey(KEY_TAG) && attributes.containsKey(VAL_TAG)) {
            return Optional.of(new SonarAttribute(attributes.get(KEY_TAG), Double.parseDouble(attributes.get(VAL_TAG))));
        }
        return Optional.empty();
    }


    private Map<String, String> parseAttribute(StartElement startElement) {
        String name = startElement.getName().getLocalPart();
        String value = null;

        while (eventReader.hasNext()) {
            XMLEvent event = getNextEventOrThrowException();
            if (event.isCharacters()) {
                value = event.asCharacters().getData();
            } else if (event.isEndElement()) {
                break;
            }
        }
        return value == null ? ImmutableMap.of() : ImmutableMap.of(name, value);
    }


    private SonarResource createResource(Map<String, String> attributeMap, List<SonarAttribute> metrics) {
        String key = attributeMap.get(KEY_TAG);
        String name = attributeMap.get(NAME_TAG);
        String lname = attributeMap.get(LNAME_TAG);
        Scope scope = Scope.valueOf(attributeMap.get(SCOPE_TAG));
        Qualifier qualifier = Qualifier.valueOf(attributeMap.get(QUALIFIER_TAG));

        return new SonarResource(metrics, key, name, scope, qualifier, lname);
    }
}


