import { ApiClient } from '../ApiClient.js';

export class SitesApi {

  constructor(apiClient) {
		this.apiClient = apiClient || ApiClient.instance;
  }
    
  async getSites(siteId) {
    const params = {
    };
    if (!siteId) {
      siteId = 'default';
    }
    params.siteId = siteId;
    const url = `https://${this.apiClient.host}/sites${this.apiClient.buildQueryString(params)}`;
    const options = this.apiClient.buildOptions('GET');
    return await this.apiClient.fetchAndRespond(url, options);
  }

}