# frozen_string_literal: true

require_relative '../../version'

module De::Sots::CellarsAndCentaurs::Domain::Model
  module Fightable
    def attack(target)
      raise NotImplementedError, "#{self.class} must implement attack"
    end

    def initiative
      raise NotImplementedError, "#{self.class} must implement initiative"
    end
  end
end
