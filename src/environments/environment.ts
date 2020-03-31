// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  baseUrl: 'brewerscanada',
  API: {
    URL: 'https://dev-brewers-insight.azure-api.net/',
    emailUrl: 'https://qa-brewersinsights.azurewebsites.net/',
  },
  sasToken: '?sv=2019-02-02&ss=bfqt&srt=sco&sp=rwdlacup&se=2020-12-30T22:07:51Z&st=2019-12-03T14:07:51Z&spr=https&sig=K5vNMgrbKRHybJowC04XIPR6nk518%2B83bz%2FrKaQW1RM%3D',
  storageAccount: 'brewersinsightstorage',
  containerNameUser: 'brewersinsight-prod/userprofile',
  containerNameCompanyLogo: 'brewersinsight-prod/companylogo',
  storageUrlUser: 'https://brewersinsightstorage.blob.core.windows.net/brewersinsight-prod/userprofile/',
  storageUrlCompanyLogo: 'https://brewersinsightstorage.blob.core.windows.net/brewersinsight-prod/companylogo/',
};
