const base = require("./electron-builder.json");
const product = require("./product.config.json");

module.exports = {
  ...base,
  appId: product.appId,
  productName: product.name,
  protocols: {
    name: `${product.name} Protocol`,
    schemes: [product.protocol],
  },
};
