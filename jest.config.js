const config = {
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    url: 'http://localhost:8000',
    withBackend: false,
    backendData: {
      policyUuid: 'D8A1ADA5-14AA-46F8-B938-BD38900D80CA',
      payerWallet: '5811724c'
    }
  }
};

module.exports = config;
