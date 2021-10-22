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

function btnSpinner(btnElm, show) {
  var btnText = btnElm.querySelector(".js-spinner-text");
  var btnSpinnerContainer = btnElm.querySelector(".js-spinner-container");

  if (show === true) {
    btnSpinnerContainer.style.display = "inline";
    btnText.style.display = "none";
  }
  if (show === false) {
    btnSpinnerContainer.style.display = "none";
    btnText.style.display = "block";
  }
}

// error banner stuff
function showBanner(bannerElm, show, bannerMsg = "Network Error!") {
  bannerElm.innerText = bannerMsg;

  if (show === true) {
    bannerElm.style.transitionTimingFunction = "ease-out";
    bannerElm.style.transform = "scale(1)";
    bannerElm.style.opacity = "1";
  }

  if (show === false) {
    bannerElm.style.transitionTimingFunction = "ease-in";
    bannerElm.style.transform = "scale(0.5)";
    bannerElm.style.opacity = "0";
  }
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
  var errorBanner = document.querySelector(".js-error-banner");

  if (paymentBtn) {
    paymentBtn.onclick = function (e) {
      e.preventDefault();
      showBanner(errorBanner, false);
      createRipple(e);
      btnSpinner(paymentBtn, true);

      // var url = "http://localhost:3000/create-checkout-session"; // temporary
      var host = "https://order-summary-page.herokuapp.com";
      var domain = "/create-checkout-session";
      var productId = 1;

      makePayment(host + domain, productId, function () {
        btnSpinner(paymentBtn, false);
        showBanner(errorBanner, true);
      });
    };
  }
})();
