export * from './editor-extensions'
import editorConfig from './editor-config.json'
import commands from './commands.json'

import astro from './techs/astro.json'
import css from './techs/css.json'
import html from './techs/html.json'
import javascript from './techs/javascript.json'
import lit from './techs/lit.json'
import next from './techs/next.json'
import reactNative from './techs/react-native.json'
import react from './techs/react.json'
import solid from './techs/solid.json'
import tailwind from './techs/tailwind.json'
import typescript from './techs/typescript.json'
import vue from './techs/vue.json'

export default {
  editorConfig,
  commands,
  techs: {
    astro,
    css,
    html,
    javascript,
    lit,
    next,
    reactNative,
    react,
    solid,
    tailwind,
    typescript,
    vue
  }
}
