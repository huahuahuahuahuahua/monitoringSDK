const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
let host = 'cn-shanghai.log.aliyuncs.com'
let project = 'czwmonitor'

module.exports = {
  entry: './src/index.js',
  context: process.cwd(),
  mode: 'development',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'monitor.js'
  },
  devServer: {
    static: path.join(__dirname, 'dist'),
    onAfterSetupMiddleware: function(devServer) {
      devServer.app.get('/success', function(req, res) {
        res.json({ id: 1 })
      })
      devServer.app.post('/fail', function(req, res) {
        res.sendStatus(500)
      })
    },
    proxy: {
      '/api': {
        target: `http://${project}.${host}`,
        pathRewrite: { '^/api': '' },
        changeOrigin: true
      }
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      inject: 'head',
      scriptLoading: 'blocking',
    })
  ]
}
