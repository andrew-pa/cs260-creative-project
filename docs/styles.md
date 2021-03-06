
# Standard CSS selectors for theming

Selector will define colors but not anything with layout. Selectors come in the format `.[color](-[mod])?-[placement]`

## `[color]`:

Selector Part   | Description
----------------|-------------
`main`          | main colorway
`accent`        | accent colorway

## `[mod]`:

Selector Part   | Description
----------------|-------------
`tint`          | colorway but desaturated (towards white)
`shade`         | colorway but saturated/darkened (towards black)

Putting `2` after either `tint` or `shade` will get a doubled version of the color that is more extreme.

## `[placement]`:

Selector Part   | Description
----------------|-------------
`fg`            | foreground (like text)
`bg`            | background
`border`        | border
