# frozen_string_literal: true

require_relative '../../version'

module De::Sots::CellarsAndCentaurs::Application::Dto
  Creature = Struct.new(:id, :type, :walking_speed, keyword_init: false) do
    def to_h
      { id: id, type: type.to_s, walking_speed: walking_speed }
    end
  end
end
