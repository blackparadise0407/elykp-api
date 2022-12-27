$(function () {
  var passwordResult = false;
  var confirmPassResult = false;

  function hasUppercaseLetter(password) {
    return /[A-Z]/.test(password);
  }

  function hasLowercaseLetter(password) {
    return /[a-z]/.test(password);
  }

  function hasSpecialChar(password) {
    return /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?\`\~]/.test(password);
  }

  function hasNumber(password) {
    return /[0-9]/.test(password);
  }

  function checkMinLength(password, minLength) {
    var passwordTrimmed = String.prototype.trim.call(password);
    return passwordTrimmed.length >= minLength;
  }

  function isEqual(password, confirm) {
    return String.prototype.trim.call(password) !== '' && password === confirm;
  }

  function popover(ele, popoverSelector, show) {
    const jEle = $(ele);
    const { top, left } = jEle.offset();
    const offsetTop = Math.round(
      top + jEle.height() / 2 - $(popoverSelector).height() / 2,
    );
    const offsetLeft = Math.round(left + jEle.width() + 28);
    $(popoverSelector).css({
      display: show ? 'block' : 'none',
      position: show ? 'fixed' : '',
      top: show ? offsetTop + 'px' : '',
      left: show ? offsetLeft + 'px' : '',
    });
  }

  function validatePassword(input) {
    var value = input.value;
    var uppercaseLetter = hasUppercaseLetter(value);
    var specialChar = hasSpecialChar(value);
    var lowercase = hasLowercaseLetter(value);
    var number = hasNumber(value);

    // If this is changed, please also update in PasswordHint.cshtml
    // and some other places
    const minLength = $(input).data('minlength') || 6;
    var validMinlenth = checkMinLength(value, minLength);
    lowercase
      ? $('.lower-letter').addClass('valid')
      : $('.lower-letter').removeClass('valid');
    uppercaseLetter
      ? $('.upper-letter').addClass('valid')
      : $('.upper-letter').removeClass('valid');
    specialChar
      ? $('.special-char').addClass('valid')
      : $('.special-char').removeClass('valid');
    number
      ? $('.number-char').addClass('valid')
      : $('.number-char').removeClass('valid');
    validMinlenth
      ? $('.longer-than').addClass('valid')
      : $('.longer-than').removeClass('valid');

    if (
      validMinlenth &&
      lowercase &&
      uppercaseLetter &&
      specialChar &&
      number
    ) {
      passwordResult = true;
    } else {
      passwordResult = false;
    }

    var confirmPassValue = $('[name="confirmPassword"]').val();
    if (confirmPassValue || $(input).attr('name') === 'confirmPassword') {
      visibleConfirmPass(confirmPassValue);
    } else {
      $('.same-password').hide();
    }

    enableSubmit(passwordResult && confirmPassResult);
  }

  function validateMatchingConfirmPass(input) {
    visibleConfirmPass(input.value);
    enableSubmit(passwordResult && confirmPassResult);
  }

  function visibleConfirmPass(value) {
    $('.same-password').show();
    var samePassword = isEqual($('[name="password"]').val(), value);
    if (samePassword) {
      confirmPassResult = true;
      $('.same-password').addClass('valid');
    } else {
      confirmPassResult = false;
      $('.same-password').removeClass('valid');
    }
  }

  function enableSubmit(enable) {
    if (enable) {
      $('.reset-btn').removeClass('button--disabled');
    } else {
      $('.reset-btn').addClass('button--disabled');
    }
  }

  $('input[name="password"]')
    .on('focusin', function () {
      popover(this, '.password-hint', true);
      validatePassword(this);
    })
    .on('focusout', function () {
      popover(this, '.password-hint', false);
    })
    .on('input', function () {
      validatePassword(this);
    });

  $('input[name="confirmPassword"]')
    .on('focusin', function () {
      popover(this, '.confirm-password-hint', true);
      validateMatchingConfirmPass(this);
    })
    .on('focusout', function () {
      popover(this, '.confirm-password-hint', false);
    })
    .on('input', function () {
      validateMatchingConfirmPass(this);
    });

  $('#reset-form').on('keyup keypress', function (e) {
    const keyCode = e.keyCode || e.which;
    if (!(passwordResult && confirmPassResult) && keyCode === 13) {
      e.preventDefault();
      return false;
    }
  });
});
