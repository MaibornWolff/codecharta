using System;
using System.Collections.Generic;
using System.Linq;

namespace De.Sots.CellarsAndCentaurs.Adapter.Persistence;

public abstract class Repository<T> where T : class
{
    private readonly Dictionary<Guid, T> store = new();

    protected abstract Guid IdOf(T item);

    public void Add(T item) => store[IdOf(item)] = item;

    public T? FindOne(Guid id) => store.TryGetValue(id, out var item) ? item : null;

    public List<T> FindAll() => store.Values.ToList();
}
