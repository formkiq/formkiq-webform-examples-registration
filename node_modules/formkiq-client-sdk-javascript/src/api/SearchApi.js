import { ApiClient } from '../ApiClient.js';

export class SearchApi {

  constructor(apiClient) {
		this.apiClient = apiClient || ApiClient.instance;
  }
    
  async search(searchParameters, siteId, previous, next, limit) {
    const params = {
    };
    if (!siteId) {
      siteId = 'default';
    }
    params.siteId = siteId;
    if (previous && previous.length) {
        params.previous = previous;
      }
      if (next && next.length) {
        params.next = next;
      }
      if (limit) {
        params.limit = limit;
      }
    const url = `https://${this.apiClient.host}/search${this.apiClient.buildQueryString(params)}`;
    const options = this.apiClient.buildOptions('POST', searchParameters);
    return await this.apiClient.fetchAndRespond(url, options);
  }

  buildTagSearchParameters(key, beginsWith, eq) {
    return new TagSearchParameters(key, beginsWith, eq);
  }

}

export class TagSearchParameters {

  constructor(key, beginsWith, eq) {
    const query = {
      tag: {}
    };
    if (key) {
      query.tag.key = key;
    }
    if (beginsWith) {
      query.tag.beginsWith = beginsWith;
    } else if (eq) {
      query.tag.eq = eq;
    }
    this.query = query;
  }

}