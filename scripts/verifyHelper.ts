/* global task ethers */
import { run } from 'hardhat'
async function verifyHelper(
  deployedAddress: string,
  router: string,
  owner: string,
) {
  await run('verify:verify', {
    address: deployedAddress,
    constructorArguments: [
      [
        '0x403E967b044d4Be25170310157cB1A4Bf10bdD0f',
        '0x44A6e0BE76e1D9620A7F76588e4509fE4fa8E8C8',
        '0x6a3E7C3c6EF65Ee26975b12293cA1AAD7e1dAeD2',
        '0x42E5E06EF5b90Fe15F853F59299Fc96259209c5C',
      ],
      [
        '0xfEC232CC6F0F3aEb2f81B2787A9bc9F6fc72EA5C',
        '0x641CA8d96b01Db1E14a5fBa16bc1e5e508A45f2B',
        '0xC765ECA0Ad3fd27779d36d18E32552Bd7e26Fd7b',
        '0xBFad162775EBfB9988db3F24ef28CA6Bc2fB92f0',
      ],
      router,
      '0x385eeac5cb85a38a9a07a70c73e0a3271cfb54a7',
      '0xC3c2e1Cf099Bc6e1fA94ce358562BCbD5cc59FE5',
    ],
  })
}

verifyHelper(
  '0x888C1DDFCDF52993E84cf00A962354063a08A6b9',
  '0xa5e0829caced8ffdd4de3c43696c57f7d7a678ff',
  '0xC3c2e1Cf099Bc6e1fA94ce358562BCbD5cc59FE5',
)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
