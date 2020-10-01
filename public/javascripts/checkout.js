Stripe.setPublishableKey('pk_test_51HWer9HlyknK7kz5AHPhzmo9t9OpN3w5VLP3fYcnoRVPDJJEvDwsI6DhoII1dOlDBLd7p6XpocEMEo4uPVMOow2B00NlLiYobC');
//grap the form
var $form = $('#checkout-form');
$form.submit(function (event) {
    $form.find('button').prop('disabled', true);
    $('#payment-error').addClass('d-none');
    Stripe.card.createToken({
        number: $('#card-number').val(),
        cvc: $('#card-cvc').val(),
        exp_month: $('#card-expiry-month').val(),
        exp_year: $('#card-expiry-year').val()
    }, stripeResponseHandler);
    return false;
});

function stripeResponseHandler(status, response) {

    if (response.error) { // Problem!
  
      // Show the errors on the form
      $('#payment-errors').text(response.error.message);
      $('#payment-errors').removeClass('d-none');
      $form.find('button').prop('disabled', false); // Re-enable submission
  
    } else { // Token was created!
  
      // Get the token ID:
      var token = response.id;
  
      // Insert the token into the form so it gets submitted to the server:
      $form.append($('<input type="hidden" name="stripeToken" />').val(token));
  
      // Submit the form:
      $form.get(0).submit();
  
    }
  }