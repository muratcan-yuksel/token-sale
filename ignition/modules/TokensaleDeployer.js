const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const awTokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

module.exports = buildModule("TokenSale", (m) => {
  const awToken = m.getParameter("awToken", awTokenAddress);

  const tokenSale = m.contract("TokenSale", [awToken, 5, 2]);

  // If you need to call any functions after deployment, you can do that here
  // m.call(tokenSale, "someFunction", [...args]);

  return { tokenSale };
});
