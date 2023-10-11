const path = require('path')
const { override, fixBabelImports, addWebpackPlugin, addWebpackAlias, adjustStyleLoaders, addWebpackModuleRule } = require('customize-cra')
const { addLessLoader } = require('./scripts/customize-cra.js')
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin')

module.exports = function (config, env) {
  config.output.chunkLoadingGlobal = 'webpackJsonp_collection'
  config.output.globalObject = 'window'

  const overrides = [
    addWebpackAlias({
      '@': path.resolve(__dirname, './src')
    }),
    addWebpackPlugin(new AntdDayjsWebpackPlugin()),
    fixBabelImports('import', {
      libraryName: 'antd',
      libraryDirectory: 'es',
      style: true
    }),
    addLessLoader({
      lessOptions: {
        javascriptEnabled: true,
        modifyVars: {
          '@ant-prefix': 'coll',
          '@iconfont-css-prefix': 'collicon',
          '@primary-color': '#608fff'
        }
      }
    }),
    addWebpackModuleRule({
      test: /\.m?js/,
      resolve: {
        fullySpecified: false
      }
    })
  ]

  if (env === 'production') {
    overrides.push(
      adjustStyleLoaders(({ use: [, css] }) => {
        const modules = css.options?.modules
        if (!modules) return
        if (modules.mode === 'local' || modules.getLocalIdent || modules.localIdentName) {
          css.options.modules.localIdentName = '[hash:6]'
          delete css.options.modules.getLocalIdent
        }
      })
    )
  }

  return override(...overrides)(config, env)
}
