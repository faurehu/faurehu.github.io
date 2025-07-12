# Jekyll plugin to generate peru-data chart route pages
# This allows direct access to /peru-data/chart-name URLs

module Jekyll
  class PeruDataRoutes < Generator
    safe true
    priority :normal

    def generate(site)
      # Read the config file to get all chart names
      config_file = File.join(site.source, 'assets', 'js', 'peru-data-widget', 'config.json')
      
      if File.exist?(config_file)
        config_data = JSON.parse(File.read(config_file))
        
        config_data['categories'].each do |category|
          category['items'].each do |item|
            # Create URL-friendly slug
            slug = item['name']
              .downcase
              .unicode_normalize(:nfd)
              .gsub(/[\u0300-\u036f]/, '') # Remove accents
              .gsub(/[^a-z0-9\s-]/, '') # Remove special characters
              .gsub(/\s+/, '-') # Replace spaces with hyphens
              .gsub(/-+/, '-') # Replace multiple hyphens with single
              .strip
            
            # Create a page for this chart route
            chart_page = PageWithoutAFile.new(site, site.source, '', "peru-data/#{slug}.html")
            chart_page.data = {
              'layout' => 'default',
              'title' => item['title'] || item['name'],
              'chart_name' => item['name']
            }
            
            # Use the same content as the main peru-data page, but strip the YAML front matter
            content = File.read(File.join(site.source, 'peru-data.html'))
            # Remove YAML front matter (everything between --- markers)
            content = content.gsub(/^---\s*\n.*?\n---\s*\n/m, '')
            chart_page.content = content
            
            site.pages << chart_page
          end
        end
      end
    end
  end
end 