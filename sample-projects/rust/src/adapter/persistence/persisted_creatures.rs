use crate::adapter::persistence::creature_entity::CreatureEntity;
use crate::adapter::persistence::creature_repository::CreatureRepository;
use crate::application::CreatureFacade;
use crate::domain::model::creature::Creature;
use crate::domain::model::creature_id::CreatureId;
use crate::domain::model::no_such_creature_exception::NoSuchCreatureException;
use crate::domain::service::creatures::Creatures;

pub struct PersistedCreatures {
    repository: CreatureRepository,
}

impl PersistedCreatures {
    pub fn new(repository: CreatureRepository) -> Self {
        PersistedCreatures { repository }
    }
}

impl Creatures for PersistedCreatures {
    fn save(&mut self, creature: Creature) {
        self.repository.save(CreatureEntity::new(Some(creature.id().id.clone())));
    }

    fn find(&self, id: &CreatureId) -> Result<Creature, NoSuchCreatureException> {
        match self.repository.find_one(&id.id) {
            Some(entity) => Ok(Creature::with_type(
                CreatureId::new(entity.id.clone()),
                CreatureFacade::STANDARD_CREATURE_TYPE,
            )),
            None => Err(NoSuchCreatureException::new(id.clone())),
        }
    }
}
