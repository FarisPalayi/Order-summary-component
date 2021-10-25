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

// to use as fallback if fetch API is not supported
function postWithXhr(url, body, callback, errCallback) {
  if (window.XMLHttpRequest) {
    var xhr = new XMLHttpRequest(); // `var` is function scoped, not block scoped
  } else {
    var xhr = new ActiveXObject("Microsoft.XMLHTTP"); // legacy
  }

  xhr.open("POST", url);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onreadystatechange = function () {
    var dataReadyToUse = 4;
    var serverRequestSuccess = 200;

    if (
      this.readyState === dataReadyToUse &&
      this.status === serverRequestSuccess
    ) {
      var data = JSON.parse(xhr.responseText);
      if (data) {
        callback(data);
      }
    } else if (this.status !== serverRequestSuccess) {
      console.error("Error: " + this.status, this.statusText);
      errCallback("Request failed! Please try again.");
    }
  };

  xhr.send(JSON.stringify(body));

  // // var timeoutInMinutes = 1;
  // var timeoutInSeconds = 10; //! temporary value
  // var timeoutInMilliSeconds = timeoutInSeconds * 1000;

  // xhr.timeout = timeoutInMilliSeconds;
  xhr.onerror = function () {
    console.error("Error: " + this.status, this.statusText);
    errCallback("Request failed! Please try again.");
  };
}

function postWithFetch(url, body, callback, errCallback) {
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
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
        callback(data);
      }
    }) // redirect
    .catch(function (err) {
      errCallback();
      console.error(err, err.error);
    });
}

function redirect(url) {
  if (window.location) {
    window.location = url;
  }
}

function makePayment(url, planId, errCallback) {
  var requestBody = {
    id: planId,
  };

  var redirectToResponseUrl = function (data) {
    redirect(data.url);
  };

  if (!window.fetch) {
    postWithXhr(url, requestBody, redirectToResponseUrl, errCallback);
    return;
  }

  postWithFetch(url, requestBody, redirectToResponseUrl, errCallback);
}

// spinner stuff

function setBtnSpinner(btnElm, show) {
  var btnText = btnElm.querySelector(".js-spinner-text");
  var btnSpinnerContainer = btnElm.querySelector(".js-spinner-container");

  if (show === true) {
    btnElm.disabled = true;
    btnSpinnerContainer.style.display = "inline";
    btnText.style.display = "none";
  }

  if (show === false) {
    btnElm.disabled = false;
    btnSpinnerContainer.style.display = "none";
    btnText.style.display = "block";
  }
}

// error banner stuff
function showErrorBanner(bannerMsg) {
  if (typeof bannerMsg !== "string") {
    bannerMsg = "Something went wrong! Please try again.";
  }

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

// dropdown list stuff
var initialPlanId = 1;
var planId = initialPlanId;

var planDetails = [
  { id: 1, name: "Weekly", price: 99, timeFrame: "week" },
  { id: 2, name: "Monthly", price: 399, timeFrame: "month" },
  { id: 3, name: "Annual", price: 3999, timeFrame: "year" },
];

function toggleDropdownVisibility(controlElm, dropdownElm, overlay) {
  dropdownElm.classList.toggle("hide");

  if (dropdownElm.classList.contains("hide")) {
    controlElm.setAttribute("aria-expanded", "false");
    overlay.style.display = "none";
    return;
  }

  controlElm.setAttribute("aria-expanded", "true");
  overlay.style.display = "block";
}

function changePlanOnSelection(
  controlElm,
  planElm,
  planPriceElm,
  planDetailsArr
) {
  var radioLabel = controlElm.nextElementSibling;
  var labelText = radioLabel.innerText;

  for (var i = 0; i < planDetailsArr.length; i++) {
    var planDetailsObj = planDetailsArr[i];
    if (planDetailsObj.name === labelText) {
      planPriceElm.innerText =
        "₹" + planDetailsObj.price + "/" + planDetailsObj.timeFrame;
      planId = planDetailsObj.id;
    }
  }

  planElm.innerText = labelText + " Plan";
}

// event listeners

(function () {
  var btns = document.querySelectorAll("button");

  window.onload = function () {
    if (!btns) {
      return;
    }

    for (var i = 0; i < btns.length; i++) {
      var btn = btns[i];
      btn.disabled = false;
    }
  };

  var heroImgElm = document.querySelector(".js-hero-img");

  heroImg.onload = function () {
    if (heroImgElm) {
      showHeroImg(heroImgElm, imgSource);
    }
  };

  var paymentBtn = document.querySelector(".js-payment-btn");

  if (paymentBtn) {
    paymentBtn.onclick = function (e) {
      createRipple(e);
    };
  }

  var form = document.querySelector(".js-form");

  if (form && paymentBtn) {
    form.onsubmit = function (e) {
      e.preventDefault();
      setBtnSpinner(paymentBtn, true);

      // var baseUrl = "http://localhost:3000"; // dev-local
      var baseUrl = "https://order-summary-page.herokuapp.com";
      var route = "/create-checkout-session";

      makePayment(baseUrl + route, planId, function (errMsg) {
        setBtnSpinner(paymentBtn, false);
        paymentBtn.disabled = false;
        errMsg ? showErrorBanner(errMsg) : showErrorBanner();
      });
    };
  }

  var changePlanBtn = document.querySelector(".js-change-plan-btn");
  var planDropdown = document.querySelector(".js-plan-dropdown");
  var planOverlay = document.querySelector(".js-plan-dropdown-overlay");

  function toggleDropdown() {
    toggleDropdownVisibility(changePlanBtn, planDropdown, planOverlay);
  }

  changePlanBtn.onclick = toggleDropdown;

  var radioElms = document.querySelectorAll(".js-plan-radio");
  var planTitle = document.querySelector(".js-plan-title");
  var planPrice = document.querySelector(".js-plan-price");

  for (var j = 0; j < radioElms.length; j++) {
    var radioElm = radioElms[j];

    radioElm.onchange = function () {
      changePlanOnSelection(this, planTitle, planPrice, planDetails);
    };

    radioElm.onkeyup = function (e) {
      //! use keyCode and e.key
      if (e.key === "Escape") {
        toggleDropdown();
      }
    };

    planOverlay.onclick = toggleDropdown;
  }
})();
