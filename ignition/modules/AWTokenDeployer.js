const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("AWToken", (m) => {
  const awToken = m.contract("AWToken");

  // If you need to call any functions after deployment, you can do that here
  // m.call(awToken, "someFunction", [...args]);

  return { awToken };
});
