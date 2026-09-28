package de.sots.cellarsandcentaurs.adapter.persistence;

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

public abstract class Repository<T> {
    private final Map<UUID, T> rows = new HashMap<>();

    protected abstract UUID idOf(T row);

    public void save(T row) {
        rows.put(idOf(row), row);
    }

    public Optional<T> findById(UUID id) {
        return Optional.ofNullable(rows.get(id));
    }

    public Collection<T> findAll() {
        return rows.values();
    }
}
