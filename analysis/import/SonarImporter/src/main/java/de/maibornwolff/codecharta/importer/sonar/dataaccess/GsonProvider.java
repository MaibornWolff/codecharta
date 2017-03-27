package de.maibornwolff.codecharta.importer.sonar.dataaccess;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import javax.ws.rs.Consumes;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.UriInfo;
import javax.ws.rs.ext.MessageBodyReader;
import javax.ws.rs.ext.Provider;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.lang.annotation.Annotation;
import java.lang.reflect.Type;

@Provider
@Consumes(MediaType.APPLICATION_JSON)
public class GsonProvider<T> implements MessageBodyReader<T> {

    private final Gson gson;

    @Context
    private UriInfo ui;

    public GsonProvider() {
        GsonBuilder builder = new GsonBuilder()
                .serializeNulls()
                .enableComplexMapKeySerialization();

        this.gson = builder.create();
    }

    @Override
    public boolean isReadable(Class<?> type, Type genericType,
                              Annotation[] annotations, MediaType mediaType) {
        return true;
    }

    @Override
    public T readFrom(Class<T> type, Type genericType, Annotation[] annotations,
                      MediaType mediaType, MultivaluedMap<String, String> httpHeaders,
                      InputStream entityStream) throws IOException, WebApplicationException {

        InputStreamReader reader = new InputStreamReader(entityStream, "UTF-8");
        try {
            return gson.fromJson(reader, type);
        } finally {
            reader.close();
        }
    }
}