use crate::application::naming::CreatureNaming;
use crate::domain::model::centaur::Centaur;
use crate::domain::model::creature_macros::creature_count;
use crate::domain::model::creature_type::CreatureType;
use crate::domain::model::fightable::Fightable;
use crate::domain::model::Lair;
use crate::domain::model::{self, creature::Creature};

pub struct CreatureReport {
    naming: CreatureNaming,
    herd: Vec<Centaur>,
    lair: Lair,
}

impl CreatureReport {
    pub fn new(naming: CreatureNaming, lair: Lair) -> Self {
        CreatureReport {
            naming,
            herd: Vec::new(),
            lair,
        }
    }

    pub fn describe(&self, creature: &Creature) -> String {
        format!(
            "{} {} lives {} deep",
            self.naming.name_for(self.herd.len()),
            creature.id().id,
            self.lair.depth()
        )
    }

    pub fn is_dragon(creature: &Creature) -> bool {
        match creature.creature_type() {
            CreatureType::Dragon => true,
            _ => false,
        }
    }

    pub fn attack_bonus_of(fighter: &impl Fightable) -> i32 {
        fighter.attack_bonus()
    }

    pub fn fastest(&self) -> model::Speed {
        model::Speed::new(self.herd.len() as u32 * 10)
    }

    pub fn initiative(&self) -> u32 {
        use crate::domain::model::dice::roll_d20;

        roll_d20().result
    }

    pub fn headcount(&self) -> usize {
        creature_count!(self.herd)
    }
}
