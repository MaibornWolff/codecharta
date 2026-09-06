use log::debug;

use crate::adapter::persistence::creature_entity::CreatureEntity as Entity;
use crate::adapter::persistence::storage::{Identified, Repository};

impl Identified for Entity {
    fn key(&self) -> String {
        self.id.clone()
    }
}

pub struct CreatureRepository {
    creatures: Repository<Entity>,
}

impl CreatureRepository {
    pub fn new() -> Self {
        CreatureRepository { creatures: Repository::new() }
    }

    pub fn save(&mut self, creature: Entity) {
        debug!("saving creature {}", creature.id);
        self.creatures.save(creature);
    }

    pub fn find_one(&self, id: &str) -> Option<&Entity> {
        self.creatures.find_one(id)
    }

    pub fn find_all(&self) -> Vec<&Entity> {
        self.creatures.find_all()
    }
}
