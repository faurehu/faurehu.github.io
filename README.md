# Source

Many thanks to [Kiko-plus theme](https://github.com/AWEEKJ/Kiko-plus).

# Build instructions

`.markdown` files in the `_post` directory will be listed if they contain a YAML front matter block.

To convert a `.ipynb` file call `jupyter nbconvert file.ipynb --to markdown`, add the front matter block to the produced markdown file, move the images to the `/assets/images` folder and correct the paths.

# Serve Instructions

- `bundle install`
- `bundle exec jekyll serve`

# Architecture

See index.html for main view.

## License

This theme is released under MIT License.
