using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace de.sots.cellarsandcentaurs.adapter.persistence
{
    using A = de.sots.cellarsandcentaurs.application;
    [Table("CreatureEntity")]
    public class CreatureEntity(Guid id)
    {
        [Key]
        public Guid Id { get; set; }=id;

        public CreatureEntity()
        {
        }
    }
}