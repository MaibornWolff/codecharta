#[allow(unused_imports)]
use crate::model::Local;
use crate::model::Speed;

pub fn fight() {
    struct Local;
    fn pace(_speed: Speed) {}
    let _local = Local;
    pace(Speed);
}
