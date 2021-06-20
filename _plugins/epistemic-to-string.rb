module Jekyll
  module AssetFilter
    def effort_to_string(input)
      print input
      input > 50 ? "high effort" : "low effort"
    end
    def status_to_string(input)
      print input
      input > 50 ? "generalizable" : "specific"
    end
  end
end

Liquid::Template.register_filter(Jekyll::AssetFilter)