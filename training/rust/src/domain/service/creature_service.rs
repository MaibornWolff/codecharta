use crate::domain::model::creature::Creature;
use crate::domain::service::creatures::Creatures;

pub struct CreatureService {
    creatures: Box<dyn Creatures>,
}

impl CreatureService {
    pub fn new(creatures: Box<dyn Creatures>) -> Self {
        CreatureService { creatures }
    }

    pub fn save(&mut self, creature: Creature) {
        self.creatures.save(creature);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::model::creature_id::CreatureId;
    use crate::domain::model::no_such_creature_exception::NoSuchCreatureException;

    struct InMemoryCreatures {
        saved: Vec<Creature>,
    }

    impl Creatures for InMemoryCreatures {
        fn save(&mut self, creature: Creature) {
            self.saved.push(creature);
        }

        fn find(&self, id: &CreatureId) -> Result<Creature, NoSuchCreatureException> {
            self.saved
                .iter()
                .find(|creature| creature.id() == id)
                .cloned()
                .ok_or_else(|| NoSuchCreatureException::new(id.clone()))
        }
    }

    #[test]
    fn should_save_creature_to_the_stable() {
        let creatures = InMemoryCreatures { saved: Vec::new() };
        let mut service = CreatureService::new(Box::new(creatures));

        service.save(Creature::new(CreatureId::new("centaur-1")));
    }
}
