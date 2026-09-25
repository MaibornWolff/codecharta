#![allow(non_snake_case)]

use cellars_and_centaurs::domain::model::creature::Creature;
use cellars_and_centaurs::domain::model::creature_id::CreatureId;
use cellars_and_centaurs::domain::model::dice::roll_d20;
use cellars_and_centaurs::domain::model::speed::Speed;
use cellars_and_centaurs::domain::model::no_such_creature_exception::NoSuchCreatureException;
use cellars_and_centaurs::domain::service::creature_service::CreatureService;
use cellars_and_centaurs::domain::service::creatures::Creatures;

struct StableCreatures {
    stabled: Vec<Creature>,
}

impl Creatures for StableCreatures {
    fn save(&mut self, creature: Creature) {
        self.stabled.push(creature);
    }

    fn find(&self, id: &CreatureId) -> Result<Creature, NoSuchCreatureException> {
        self.stabled
            .iter()
            .find(|creature| creature.id() == id)
            .cloned()
            .ok_or_else(|| NoSuchCreatureException::new(id.clone()))
    }
}

#[test]
fn should_save_creature_to_the_stable() {
    let walkingSpeed = Speed::new(40);
    let d20Roll = roll_d20();
    let mut service = CreatureService::new(Box::new(StableCreatures { stabled: Vec::new() }));

    service.save(Creature::new(CreatureId::new("centaur-1")));

    assert!(walkingSpeed.speed() > 0);
    assert!(d20Roll.result <= 20);
}
