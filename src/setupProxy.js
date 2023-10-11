const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function (app) {
  const apiProxy = createProxyMiddleware({
    target: 'localhost:4000',
    changeOrigin: true,
    secure: false
  })

  app.use('/api', apiProxy)
}
