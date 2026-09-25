# frozen_string_literal: true

module De::Sots::CellarsAndCentaurs::Application::Dto
  class CreatureCard < Creature
    def title
      "#{type} #{id}"
    end
  end
end
