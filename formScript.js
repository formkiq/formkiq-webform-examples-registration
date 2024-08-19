let formkiqClient;

      window.onload = () => {
        /*
        * In order to auto-wire form or submit manually to the FormKiQ Core API,
        * you must create an instance of FormkiqClient
        *  
        * NOTE: you must replace "<ID>" and "<REGION>" with the ID and Region in your 
        * FormKiQ Core HTTP API URL, which can be found in your CloudFormation Outputs
        * (see https://github.com/formkiq/formkiq-core#cloudformation-outputs)
        */
        formkiqClient = new FormkiqClient('<ID>.execute-api.<REGION>.amazonaws.com');
      }

      /*
      * You can submit the form manually using this function.
      *
      * NOTE: if you want to add an onsubmit attribute to your form, be sure to
      * append "return false;" after your onsubmit code, to prevent the page submitting.
      */
      function submitForm(thisForm) {
        // only needed for manual form submitting
        formkiqClient.webFormsHandler.submitFormkiqForm(thisForm);
      }

      function onFormSubmitted(formName) {
        // this event is fired when the form has been submitted
        console.log(`${formName} has been submitted for processing.`);
      }

      function onFormCompleted(formName, response) {
        // this event is fired when the form processing has been completed
        console.log(`${formName} has been received and processed. Response below:`);
        console.log(response);
        var responseDiv = document.getElementById('response');
        if (responseDiv) {
          responseDiv.classList.remove('hidden');
          window.scrollBy(0, 200);
        }
      }