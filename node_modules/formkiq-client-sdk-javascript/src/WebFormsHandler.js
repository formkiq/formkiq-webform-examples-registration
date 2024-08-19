import { ApiClient } from './ApiClient.js';
import { DocumentsApi } from './api/DocumentsApi.js';

export class WebFormsHandler {
  
  constructor(apiClient, documentsApi) {
    this.apiClient = apiClient || ApiClient.instance;
		this.documentsApi = documentsApi || DocumentsApi.instance;
  }

  checkWebFormsInDocument() {
    const fkqFormElements = Array.from(document.getElementsByTagName('FORM'))
      .filter((formElement) => formElement.classList.contains('fkq-form'));
    fkqFormElements.forEach((fkqFormElement) => {
      fkqFormElement.setAttribute('action', 'JavaScript://');
      fkqFormElement.onsubmit = (event) => {
        this.submitFormkiqForm(event.target);
      };
    });
  }

  async submitFormkiqForm(fkqFormElement) {
    const data = {};
    data.attachmentFields = [];
    data.formFields = [];
    if (fkqFormElement.getAttribute('name')) {
      data.formName = fkqFormElement.getAttribute('name');
    }
    const formNameForCallbacks = data.formName ? data.formName : 'Unknown Form';
    if (onFormSubmitted) {
      onFormSubmitted(formNameForCallbacks);
    }
    const formFieldElements = fkqFormElement.querySelectorAll('input, select, textarea');
    formFieldElements.forEach((formFieldElement) => {
      let formField;
      switch (formFieldElement.tagName) {
        case 'INPUT':
          switch (formFieldElement.type) {
            case 'button':
            case 'reset':
            case 'submit':
              // ignore element
              break;
            case 'checkbox':
            case 'radio':
              let fieldName = '';
              if (formFieldElement.getAttribute('name')) {
                fieldName = formFieldElement.getAttribute('name');
              }
              let formFieldIndex = -1;
              if (fieldName && data.formFields.length) {
                const matchingFormFields = data.formFields.filter((formField) => formField.fieldName === fieldName);
                if (matchingFormFields.length) {
                  formFieldIndex = data.formFields.indexOf(matchingFormFields[0]);
                }
              }
              if (formFieldIndex === -1) {
                formField = {};
                if (fieldName) {
                  formField.fieldName = fieldName;
                }
                if (formFieldElement.type === 'checkbox') {
                  formField.values = [];
                  if (formFieldElement.checked) {
                    formField.values.push(formFieldElement.value);
                  }
                } else {
                  if (formFieldElement.checked) {
                    formField.value = formFieldElement.value;
                  }
                }
                data.formFields.push(formField);
              } else {
                if (formFieldElement.checked) {
                  if (formFieldElement.type === 'checkbox') {
                    data.formFields[formFieldIndex].values.push(formFieldElement.value);
                  } else {
                    data.formFields[formFieldIndex].value = formFieldElement.value;
                  }
                }
              }
              break;
            case 'file':
              const attachmentField = {};
              if (formFieldElement.getAttribute('name')) {
                attachmentField.fieldName = formFieldElement.getAttribute('name');
              }
              if (formFieldElement.value.length) {
                attachmentField.hasFile = true;
              } else {
                attachmentField.hasFile = false;
              }
              data.attachmentFields.push(attachmentField);
              break;
            default:
              formField = {};
              if (formFieldElement.getAttribute('name')) {
                formField.fieldName = formFieldElement.getAttribute('name');
              }
              formField.value = formFieldElement.value;
              data.formFields.push(formField);
              break; 
          }
          break;
        case 'SELECT':
          formField = {};
          if (formFieldElement.getAttribute('name')) {
            formField.fieldName = formFieldElement.getAttribute('name');
          }
          if (formFieldElement.multiple) {
            const selectOptions = Array.from(formFieldElement.options);
            formField.values = selectOptions.filter(option => option.selected).map(option => option.value);
          } else {
            formField.value = formFieldElement.options[formFieldElement.selectedIndex].value;
          }
          data.formFields.push(formField);
          break;
        case 'TEXTAREA':
          formField = {};
          if (formFieldElement.getAttribute('name')) {
            formField.fieldName = formFieldElement.getAttribute('name');
          }
          formField.value = formFieldElement.value;
          data.formFields.push(formField);
          break;
      }
    });
    const content = JSON.stringify(data);
    const tags = [];
    if (data.formName) {
      tags.push(
        {
          key: 'webformName',
          value: JSON.stringify(data.formName).replace(/\"/g, '')
        }
      );
    }
    let path = null;
    if (window.location.href) {
      path = window.location.href;
    }
    const addOrUpdateDocumentParameters = this.documentsApi.buildDocumentParametersForAddOrUpdate(content, 'application/json', path, tags);
    const fileInputElements = Array.from(fkqFormElement.getElementsByTagName('INPUT')).filter((input) => input.type === 'file');
    fileInputElements.forEach((fileInputElement) => {
      if (fileInputElement.value) {
        const path = fileInputElement.value.replace('C:\\fakepath\\', '');
        addOrUpdateDocumentParameters.addAttachment(path, [this.documentsApi.buildDocumentTagParametersForAdd('fieldName', fileInputElement.getAttribute('name'))]);    
      }
    });
    const response = await this.sendFormRequests(addOrUpdateDocumentParameters, fileInputElements);
    if (onFormCompleted) {
      onFormCompleted(formNameForCallbacks, response);
    } else {
      console.log('no onFormCompleted function found for ${formNameForCallbacks}. Response below:')
      console.log(response);
    }
  }

  async sendFormRequests(addOrUpdateDocumentParameters, fileInputElements) {
    const response = {};
    await Promise.resolve(new Promise((resolve) => {
      this.documentsApi.addDocumentUsingPublicPath(addOrUpdateDocumentParameters).then((addResponse) => {
        if (addResponse.documentId) {
          if (addResponse.documents) {
            const attachmentPromises = [];
            addResponse.documents.filter((document) => document.uploadUrl).forEach((document, index) => {
              const fileInputElement = fileInputElements[index];
              if (fileInputElement && fileInputElement.value) {
                const file = fileInputElement.files[0];
                attachmentPromises.push(new Promise((uploadResolve) => {
                  this.apiClient.uploadFile(document.uploadUrl, file).then((uploadResponse) => {
                    uploadResolve();
                  });
                }));
              }
            });
            if (attachmentPromises.length) {
              Promise.all(attachmentPromises).then(() => {
                response.success = true;
                response.message = `Form has been submitted and received, along with ${attachmentPromises.length} attachments.`;
                resolve();
              });
            } else {
              response.success = true;
              response.message = `Form has been submitted and received, but not all attachments were received successfully.`;
              resolve();
            }
          } else {
            response.success = true;
            response.message = `Form has been submitted and received.`;
            resolve();
          }
        } else {
          response.success = false;
          response.message = `Form failed to be processed successfully. Please try again later.`;
          resolve();
        }
        
      });
    }));
    return response;
  }

}
