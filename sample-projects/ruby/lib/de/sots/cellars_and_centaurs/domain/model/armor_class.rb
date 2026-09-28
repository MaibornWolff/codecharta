# frozen_string_literal: true

require_relative '../../version'
require_relative '../../application'

module De::Sots::CellarsAndCentaurs::Domain::Model
  class ArmorClass
    attr_accessor :description, :base, :bonus, :total

    def initialize(base, bonus, description = De::Sots::CellarsAndCentaurs::Application::CreatureUtil::STANDARD_ARMOR_CLASS_DESCRIPTION)
      @description = description
      @base = base
      @bonus = bonus
      @total = base + bonus
    end

    def natural?
      description == De::Sots::CellarsAndCentaurs::Application::CreatureUtil::STANDARD_ARMOR_CLASS_DESCRIPTION
    end
  end
end
