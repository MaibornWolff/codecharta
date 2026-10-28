use crate::limits::MAX;

pub fn rule(roll: u8) -> u8 {
    match roll {
        MAX => 1,
        other => other,
    }
}
