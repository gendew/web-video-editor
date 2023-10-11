/**
 * 基于customize-cra源码修改，以支持webpack5，如果customize-cra更新支持react-scripts v5(webpack v5)后可以去掉该文件
 */

exports.addLessLoader =
  (loaderOptions = {}, customCssModules = {}) =>
  config => {
    const MiniCssExtractPlugin = require('mini-css-extract-plugin')
    const postcssNormalize = require('postcss-normalize')

    const cssLoaderOptions = loaderOptions.cssLoaderOptions || {}

    const { localIdentName } = loaderOptions
    let cssModules = loaderOptions.cssModules || { localIdentName }

    if (!cssModules.localIdentName) {
      cssModules = customCssModules
    }

    cssModules.localIdentName = cssModules.localIdentName || '[local]--[hash:base64:5]'

    const lessRegex = /\.less$/
    const lessModuleRegex = /\.module\.less$/

    const webpackEnv = process.env.NODE_ENV
    const isEnvDevelopment = webpackEnv === 'development'
    const isEnvProduction = webpackEnv === 'production'
    const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false'
    const publicPath = config.output.publicPath
    const shouldUseRelativeAssetPaths = publicPath === './'

    // copy from react-scripts
    // https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/config/webpack.config.js#L93
    const getStyleLoaders = (cssOptions, preProcessor) => {
      const loaders = [
        isEnvDevelopment && require.resolve('style-loader'),
        isEnvProduction && {
          loader: MiniCssExtractPlugin.loader,
          options: shouldUseRelativeAssetPaths ? { publicPath: '../../' } : {}
        },
        {
          loader: require.resolve('css-loader'),
          options: cssOptions
        },
        {
          loader: require.resolve('postcss-loader'),
          options: {
            postcssOptions: {
              plugins: () => [
                require('postcss-flexbugs-fixes'),
                require('postcss-preset-env')({
                  ident: 'postcss',
                  autoprefixer: {
                    flexbox: 'no-2009'
                  },
                  stage: 3
                }),
                postcssNormalize()
              ]
            },
            sourceMap: isEnvProduction && shouldUseSourceMap
          }
        }
      ].filter(Boolean)
      if (preProcessor) {
        loaders.push(
          {
            loader: require.resolve('resolve-url-loader'),
            options: {
              sourceMap: isEnvProduction && shouldUseSourceMap
            }
          },
          {
            loader: require.resolve(preProcessor),
            // not the same as react-scripts
            options: Object.assign(
              {
                sourceMap: true
              },
              loaderOptions
            )
          }
        )
      }
      return loaders
    }

    const loaders = config.module.rules.find(rule => Array.isArray(rule.oneOf)).oneOf

    // Insert less-loader as the penultimate item of loaders (before file-loader)
    loaders.splice(
      loaders.length - 1,
      0,
      {
        test: lessRegex,
        exclude: lessModuleRegex,
        use: getStyleLoaders(
          Object.assign(
            {
              importLoaders: 2,
              sourceMap: isEnvProduction && shouldUseSourceMap
            },
            cssLoaderOptions
          ),
          'less-loader'
        )
      },
      {
        test: lessModuleRegex,
        use: getStyleLoaders(
          Object.assign(
            {
              importLoaders: 2,
              sourceMap: isEnvProduction && shouldUseSourceMap
            },
            cssLoaderOptions,
            {
              modules: cssModules
            }
          ),
          'less-loader'
        )
      }
    )

    return config
  }
