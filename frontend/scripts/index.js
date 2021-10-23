"use strict";

// Hero Image stuff

var imgSource = "../images/illustration-hero.svg";
var heroImg = new Image(); // creates a new html img element
heroImg.src = imgSource;

function showHeroImg(imgElm, imgSrc) {
  imgElm.style.backgroundImage = "url(" + imgSrc + ")";
  imgElm.style.opacity = "1";
}

// Ripple stuff

function createRipple(event) {
  var button = event.currentTarget;
  var circle = document.createElement("span");
  var diameter = Math.max(button.clientWidth, button.clientHeight); // select whichever's big
  var radius = diameter / 2;

  var circleLeftPositionOnXAxix = event.clientX - button.offsetLeft;
  var circleTopPositionOnYAxix = event.clientY - button.offsetTop;

  circle.style.width = circle.style.height = diameter + "px";
  circle.style.left = circleLeftPositionOnXAxix - radius + "px"; // subtracting radius to put it on the center
  circle.style.top = circleTopPositionOnYAxix - radius + "px"; // here too
  circle.classList.add("ripple");

  var ripple = button.querySelector(".ripple");

  if (ripple) {
    ripple.remove();
  }

  button.appendChild(circle);

  circle.onanimationend = function () {
    button.removeChild(circle);
  };
}

// payment stuff

function makePayment(url, productId, errCallback = false) {
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      items: [{ id: productId }],
    }),
  })
    .then(function (res) {
      if (res.ok) {
        return res.json();
      }

      errCallback("Network Error!");

      return res.json().then(function (err) {
        Promise.reject(err.error);
      });
    })
    .then(function (data) {
      if (data) {
        window.location = data.url;
      }
    }) // redirect
    .catch(function (err) {
      console.error(err, err.error);
      if (errCallback) {
        errCallback();
      }
    });
}

// spinner stuff

function setBtnSpinner(btnElm, show) {
  var btnText = btnElm.querySelector(".js-spinner-text");
  var btnSpinnerContainer = btnElm.querySelector(".js-spinner-container");

  if (show === true) {
    btnSpinnerContainer.style.display = "inline";
    btnText.style.display = "none";
    btnElm.style.cursor = "not-allowed";
  }
  if (show === false) {
    btnSpinnerContainer.style.display = "none";
    btnText.style.display = "block";
    btnElm.style.cursor = "pointer";
  }
}

// error banner stuff
function showErrorBanner(
  bannerMsg = "Something went wrong! Please try again."
) {
  var errorBanner = document.querySelector(".js-error-banner");
  var bannerShowDuration = 2500;

  errorBanner.innerText = bannerMsg;
  errorBanner.style.transitionTimingFunction = "ease-out";
  errorBanner.style.transform = "scale(1)";
  errorBanner.style.opacity = "1";

  setTimeout(function () {
    errorBanner.style.transitionTimingFunction = "ease-in";
    errorBanner.style.transform = "scale(0.5)";
    errorBanner.style.opacity = "0";
  }, bannerShowDuration);
}

// event listeners

(function () {
  var heroImgElm = document.querySelector(".js-hero-img");

  heroImg.onload = function () {
    if (heroImgElm) {
      showHeroImg(heroImgElm, imgSource);
    }
  };

  var paymentBtn = document.querySelector(".js-payment-btn");

  if (paymentBtn) {
    paymentBtn.onclick = function (e) {
      e.preventDefault();
      setBtnSpinner(paymentBtn, true);
      createRipple(e);

      // var baseUrl = "http://localhost:3000"; // dev-local
      var baseUrl = "https://order-summary-page.herokuapp.com";
      var route = "/create-checkout-session";
      var productId = 1;

      makePayment(baseUrl + route, productId, function (errMsg) {
        setBtnSpinner(paymentBtn, false);
        errMsg ? showErrorBanner(errMsg) : showErrorBanner();
      });
    };
  }
})();
