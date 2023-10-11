/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin')

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/**/*.html'],
  important: '#t',
  theme: {
    extend: {},
    customGroups: ['a', 'b', 'c']
  },
  corePlugins: {
    preflight: false
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
    plugin(({ addVariant, theme }) => {
      ;(theme('customGroups') || []).forEach(group => {
        addVariant(`group-${group}-hover`, () => {
          return `:merge(.group-${group}):hover &`
        })
      })
    })
  ]
}
