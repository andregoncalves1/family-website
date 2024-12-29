// frontend/vue.config.js
module.exports = {
    transpileDependencies: ['vuetify'],
    devServer: {
      port: 8081,
    },
    css: {
        loaderOptions: {
          sass: {
            additionalData: `
              @use "vuetify/styles" as *;
            `,
          },
        },
    },
  }
  