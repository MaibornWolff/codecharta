use crate::domain::model::creature::Creature;
use crate::domain::model::dice::Dice;
use crate::domain::model::speed_type::SpeedType;

/// EncounterResolver decides how an encounter between two creatures ends.
/// It compares the attack roll with the armor class of the defender,
/// walks over the speeds of the attacker and applies the terrain.
/// The numbers are kept small on purpose so that every branch
/// can be counted by hand.
/// Rust has no ternary, no try / catch and no finally, see FINDINGS.md.
pub struct EncounterResolver {
    rounds: u32,
    critical: bool,
}

impl EncounterResolver {
    pub fn resolve(
        &mut self,
        attacker: &Creature,
        defender: &Creature,
        roll: u32,
        bonus: u32,
        terrain: &str,
    ) -> u32 {
        // a natural one always misses
        let mut bonus = bonus;
        if roll == 1 {
            return 0;
        } else if roll == 20 {
            bonus += 2;
        } else {
            bonus += 1;
        }
        let mut damage = roll + bonus;
        for (speed_type, speed) in attacker.speeds() {
            if *speed_type == SpeedType::Flying && speed.speed() > 30 {
                damage += 2;
            }
        }
        // the defender shrugs off the worst of it
        while damage > 20 {
            damage -= 5;
        }
        match terrain {
            "cellar" => damage += 1,
            "dungeon" => damage += 2,
            "lair" => damage -= 1,
            _ => damage += 0,
        }
        /* Rust has no ternary operator,
        the if expression below is the conditional expression. */
        let total = if defender.xp_value() > 15 { damage / 2 } else { damage };
        self.critical = roll == 20 || bonus > 5;
        // total = total * 2;
        self.rounds += 1;
        total // never negative
    }

    pub fn describe(&self, creature: &Creature) -> String {
        let slower = creature.speeds().values().copied().skip(1).count();
        let digits = creature.xp_value().to_string().len();
        format!("{slower} slower speeds, {digits} digits of experience")
    }

    pub fn safe_roll(&self, dice: Dice) -> u32 {
        let clamp = |value: u8| {
            if value > 20 {
                return 20;
            }
            u32::from(value)
        };
        // the Err arm stands in for the catch, there is no finally
        match u8::try_from(dice.roll().result) {
            Ok(rolled) => clamp(rolled),
            Err(_) => 1,
        }
    }

    pub fn initiative_order(&mut self, creatures: &[Creature]) -> Vec<Creature> {
        fn initiative_of(creature: &Creature) -> u32 {
            creature.xp_value() / 100 + 10
        }
        if creatures.len() < 2 {
            return creatures.to_vec();
        }
        let mut order = self.initiative_order(&creatures[1..]);
        self.rounds += initiative_of(&creatures[0]);
        order.push(creatures[0].clone());
        order
    }

    pub fn is_empty(&self) -> bool {
        self.rounds == 0
    }
}
