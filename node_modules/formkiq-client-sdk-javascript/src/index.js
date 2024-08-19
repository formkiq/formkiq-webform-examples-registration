import { ApiClient } from './ApiClient.js';
import { WebFormsHandler } from './WebFormsHandler.js';
import { DocumentsApi } from './api/DocumentsApi.js';
import { PresetsApi } from './api/PresetsApi.js';
import { SearchApi } from './api/SearchApi.js';
import { SitesApi } from './api/SitesApi.js';
import { VersionApi } from './api/VersionApi.js';

export class FormkiqClient {
    
  constructor(host, userPoolId, clientId) {
    this.apiClient = new ApiClient(host, userPoolId, clientId);
    this.documentsApi = new DocumentsApi();
    this.presetsApi = new PresetsApi();
    this.searchApi = new SearchApi();
    this.sitesApi = new SitesApi();
    this.versionApi = new VersionApi();
    this.webFormsHandler = new WebFormsHandler();
    this.webFormsHandler.checkWebFormsInDocument();
  }

  login(email, password) {
    if (this.apiClient.cognitoClient) {
      return this.apiClient.cognitoClient.login(email, password);
    } else {
      return {
        message: 'No authentication client (e.g., Cognito) has been initialized.'
      };
    }
  }

  logout() {
    return this.apiClient.logout();
  }

}