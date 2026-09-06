# frozen_string_literal: true

require_relative '../lib/cellars_and_centaurs'

RSpec.configure do |config|
  config.expect_with(:rspec) { |expectations| expectations.syntax = :expect }
  config.order = :random
end
