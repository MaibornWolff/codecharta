# frozen_string_literal: true

module De::Sots::CellarsAndCentaurs::Domain::Model
  class Trap
    extend Fightable

    def self.attack(target)
      target.hit_points = target.hit_points.take_damage(3)
    end

    def self.initiative
      0
    end
  end
end
