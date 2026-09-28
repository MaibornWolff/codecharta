#include "ArmorClass.hpp"

#include "../../application/Application.hpp"

namespace de::sots::cellarsandcentaurs::domain::model {

ArmorClass::ArmorClass(int base, int bonus)
    : ArmorClass(base, bonus, application::CreatureUtil::STANDARD_ARMOR_CLASS_DESCRIPTION) {}

ArmorClass::ArmorClass(int base, int bonus, std::string description)
    : description_{std::move(description)}, base_{base}, bonus_{bonus}, total_{base + bonus} {}

void ArmorClass::setBase(int base) noexcept {
    base_ = base;
    total_ = base_ + bonus_;
}

void ArmorClass::setBonus(int bonus) noexcept {
    bonus_ = bonus;
    total_ = base_ + bonus_;
}

}
