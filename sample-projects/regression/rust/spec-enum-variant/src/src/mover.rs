use crate::speed_type::SpeedType;

pub fn pace() -> u8 {
    match SpeedType::Walking {
        SpeedType::Walking => 1,
        SpeedType::Flying => 2,
    }
}
