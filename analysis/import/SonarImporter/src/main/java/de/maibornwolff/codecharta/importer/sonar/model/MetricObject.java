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

package de.maibornwolff.codecharta.importer.sonar.model;

import com.google.common.collect.ImmutableList;

import java.util.List;

/**
 * see https://github.com/SonarSource/sonarqube/tree/master/sonar-plugin-api
 */
public class MetricObject {
    private static final List<String> FLOAT_TYPES = ImmutableList.of("INT", "FLOAT", "PERCENT", "MILLISEC");

    private final int id;
    private final String key;
    private final String type;
    private final String name;
    private final String description;
    private final String domain;
    private final double direction;
    private final boolean qualitative;
    private final boolean hidden;
    private final boolean custom;

    public MetricObject(int id, String key, String type, String name, String description, String domain, double direction, boolean qualitative, boolean hidden, boolean custom) {
        this.id = id;
        this.key = key;
        this.type = type;
        this.name = name;
        this.description = description;
        this.domain = domain;
        this.direction = direction;
        this.qualitative = qualitative;
        this.hidden = hidden;
        this.custom = custom;
    }

    public String getKey() {
        return key;
    }

    public boolean isFloatType() {
        return FLOAT_TYPES.contains(type);
    }
}
