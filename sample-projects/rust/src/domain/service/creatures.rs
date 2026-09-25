use crate::domain::model::creature::Creature;
use crate::domain::model::creature_id::CreatureId;
use crate::domain::model::no_such_creature_exception::NoSuchCreatureException;

pub trait Creatures {
    fn save(&mut self, creature: Creature);

    fn find(&self, id: &CreatureId) -> Result<Creature, NoSuchCreatureException>;
}
