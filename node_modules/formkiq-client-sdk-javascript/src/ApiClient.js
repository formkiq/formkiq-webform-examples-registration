import { CognitoClient } from './CognitoClient.js';

export class ApiClient {
    
  host = 'api-demo.tryformkiq.com';
  validDateRegExp = /^d{4}-d{2}-d{2}$/;
  validTZRegExp = /(([+-]?)(d{2}):?(d{0,2}))/;

  get instance() {
		return ApiClient.instance;
	}

	set instance(value) {
		ApiClient.instance = value;
	}

  constructor(host, userPoolId, clientId) {
    if (host) {
      host = host.replace('https://', '').replace(/\/+$/, '');
      this.host = host;
    }
    if (userPoolId && clientId) {
      this.buildCognitoClient(userPoolId, clientId);
    }
    if (!ApiClient.instance) { 
      ApiClient.instance = this;
    }
  }

  logout() {
    this.cognitoClient = null;
  }

  buildCognitoClient(userPoolId, clientId) {
    this.cognitoClient = new CognitoClient(userPoolId, clientId);
  }

  buildQueryString(params) {
    var arr = Object.keys(params).map(function (k) {
      return k + '=' + encodeURIComponent(params[k])
    });
    if (arr.length) {
      return '?' + arr.join('&');
    }
    return '';
  }

  buildOptions(method, body, headers, stripAuthentication) {
    const options = {
      method
    };
    if (!headers) {
      headers = {};
    }
    if (!stripAuthentication && this.cognitoClient && this.cognitoClient.idToken) {
      headers['Authorization'] = this.cognitoClient.idToken;
    }
    if (body) {
      if (typeof body === 'string') {
        options.body = body;
      } else if (typeof body === 'object') {
        options.body = JSON.stringify(body);
      }
    }
    options.headers = headers;
    return options;
  }

  async fetchAndRespond(url, options) {
    let response;
    await Promise.resolve(new Promise((resolve) => {
      fetch(url, options).then(response => response.json())
      .then(data => {
        response = data;
        resolve();
      });
    }));
    return response;
  }

  async uploadFile(url, file) {
    let response;
    await Promise.resolve(new Promise((resolve) => {
      var xhttp = new XMLHttpRequest();
      xhttp.open("PUT", url, true);
      xhttp.setRequestHeader('Content-Type', file.type);
      xhttp.onreadystatechange = function() {
        if (this.status == 200) {          
          response = {
            message: 'File uploaded successfully'
          };
        } else {
          response = {
            message: 'An unexpected error has occurred'
          };
        }
        resolve();      
      };
      xhttp.send(file);
    }));
    return response;
  }

}
