# formkiq-client-sdk-javascript
FormKiQ Client SDK - JavaScript

**Note: This Initial Version comes with CommonJS and ES6 versions**

## Installation
```sh
npm i formkiq-client-sdk-javascript
```

FormKiQ Client SDK should now be available as part of your *node_modules*.

## Instructions for Use (Web/CommonJS)
Note: while these instructions are for including this SDK in a script tag, you can also use the ES6 version for frameworks such as Angular and React JS: ./node_modules/formkiq-client-sdk-javascript/dist/formkiq-client-sdk-es6.js


```html
<script type="text/javascript" src="./node_modules/formkiq-client-sdk-javascript/dist/web-cjs/formkiq-client-sdk-cjs.js"></script>
<script type="text/javascript">
      
  let formkiqClient;
  window.onload = () => {
    
    // specify Host, Cognito User Pool Id, and Cognito Client Id
    formkiqClient = new FormkiqClient(
      '{FormKiQHttpApiUrl',
      '{userPoolId}',
      '{clientId}'
    );
    
    // obviously this would not be hard-coded for non-public creds
    // NOTE: these public credentials for demo@formkiq.com are for read-only access
    formkiqClient.login('{email}', '{password}');

    // get current version of FormKiQ
    formkiqClient.VersionApi.getVersion().then((response) => {
      console.log(response);
    });

  }

</script>
```

## Automatic Handling of Web Forms

**Example: [Contact Form](https://github.com/formkiq/formkiq-webform-examples-contact)**

**Example (with attachments): [Job Application Form](https://github.com/formkiq/formkiq-webform-examples-jobapplication)**

To add processing to any web form using FormKiQ, add the class "fkq-form" to your HTML FORM tag:

```html
<form class="fkq-form">
```

No action or onsubmit is required or desired, as FormKiQ Web Form Handler will automatically create the submission action.

A submit button is expected, to trigger the onsubmit event that the Web Form Handler uses to submit the form:

```html
<input
  type="submit"
  value="Submit Your Fake Application"
  />
```

NOTE: You can use any input type, including **text inputs**, **passwords**, **checkboxes**, **radio buttons**, or **file uploads**. **Selects** (dropdowns, whether single value or multiple) and **textareas** are also available for use by the Web Form Handler. 

There are two callbacks included in the Web Form Handler:
- **onFormSubmitted**(formName)
- **onFormCompleted**(formName, response: {})

Any input fields that should be required should include a "required" HTML Attribute, and those will prevent the form from submitting. To create custom validation rules, you should submit the form manually using **onsubmit**, and add extra validation in the triggered submit function.

## Submitting a Form Manually

You can submit the form manually using **formkiqClient.webFormsHandler.submitFormkiqForm(thisForm);**



