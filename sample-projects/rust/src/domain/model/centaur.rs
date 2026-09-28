use std::ops::Deref;

use crate::domain::model::creature::Creature;
use crate::domain::model::creature_id::CreatureId;
use crate::domain::model::creature_type::CreatureType;
use crate::domain::model::fightable::Fightable;

#[derive(Debug, Clone)]
pub struct Centaur {
    base: Creature,
    stable_name: String,
}

impl Centaur {
    pub fn new(id: CreatureId, stable_name: impl Into<String>) -> Self {
        Centaur {
            base: Creature::with_type(id, CreatureType::Monstrosity),
            stable_name: stable_name.into(),
        }
    }

    pub fn stable_name(&self) -> &str {
        &self.stable_name
    }
}

impl Deref for Centaur {
    type Target = Creature;

    fn deref(&self) -> &Creature {
        &self.base
    }
}

impl Fightable for Centaur {
    fn attack_bonus(&self) -> i32 {
        self.base.attack_bonus() + 2
    }
}
