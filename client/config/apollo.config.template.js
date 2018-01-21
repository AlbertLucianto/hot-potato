/**
 * Duplicate this file,
 * then change its name into `apollo.config.js`.
 */

const isProduction = process.env.NODE_ENV === 'production';

const configs = {
  dev: {
    uri: '<your_dev_graphql_api_endpoint>', // Mine is: 'http://localhost:60000/simple/v1/cjbeszs0u00020127v5x15uuc'
  },
  prod: {
    uri: '<your_production_graphql_api_endpoint>',
  },
};

export default isProduction ? configs.prod : configs.dev;
