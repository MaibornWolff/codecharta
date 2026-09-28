using System;
using de.sots.cellarsandcentaurs.domain.model;
using Microsoft.EntityFrameworkCore;

namespace de.sots.cellarsandcentaurs.adapter.persistence
{
    public interface CreatureRepository
    {
        DbSet<TEntity> Entities { get; }
        TEntity Find(TKey id);
        void Add(TEntity entity);
        void Update(TEntity entity);
        void Remove(TEntity entity);
    }
}