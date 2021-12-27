// --------- Utils ---------

var doc = document,
  win = window,
  query = function (selector) {
    return doc.querySelector(selector);
  },
  queryAll = function (selector) {
    return doc.querySelectorAll(selector);
  };

function disableBtn(btn, disable) {
  if (disable == null) disable = true;
  btn.disabled = disable;

  disable
    ? btn.classList.add("btn-disabled")
    : btn.classList.remove("btn-disabled");
}

// --------- Hero Image stuff-------------

var imgSource = "../images/illustration-hero.svg";
var heroImg = new Image(); // creates a new html img element
heroImg.src = imgSource;

function setBackgroundImg(elem, imgSrc) {
  elem.style.backgroundImage = "url(" + imgSrc + ")";
  elem.style.opacity = "1";
}

// --------- Ripple stuff -----------

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

  if (circle.classList) circle.classList.add("ripple");

  var ripple = button.querySelector(".ripple");

  if (ripple) button.removeChild(circle);

  button.appendChild(circle);

  circle.onanimationend = function () {
    button.removeChild(circle);
  };
}

// --------- payment stuff ---------

// to use as fallback if fetch API is not supported
function postWithXhr(url, body, timeoutInS, callback, errCallback) {
  // note: `var` is function scoped, not block scoped
  if (win.XMLHttpRequest) var xhr = new XMLHttpRequest();
  else var xhr = new ActiveXObject("Microsoft.XMLHTTP"); // legacy

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
      if (data) callback(data);
    } else if (this.status !== serverRequestSuccess) {
      console.error("Error: " + this.status, this.statusText);
      errCallback("Request failed! Please try again.");
    }
  };

  xhr.send(JSON.stringify(body));

  var timeoutInMilliSeconds = timeoutInS * 1000;

  setTimeout(function () {
    if (xhr.readyState !== 4) {
      xhr.abort();
      errCallback("Request timed out! Please try again.");
    }
  }, timeoutInMilliSeconds);

  xhr.ontimeout = function () {
    console.error("Timeout error: " + this.status, this.statusText);
    errCallback("Request timed out! Please try again.");
  };

  xhr.onerror = function () {
    console.error("Error: " + this.status, this.statusText);
    errCallback("Request failed! Please try again.");
  };
}

function postWithFetch(url, body, timeoutInS, callback, errCallback) {
  var controller = new AbortController(); // to abort request
  var signal = controller.signal;

  fetch(url, {
    method: "POST",
    signal: signal,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  })
    .then(function (res) {
      if (res.ok) return res.json();

      errCallback("Network Error!");

      return res.json().then(function (err) {
        Promise.reject(err.error);
      });
    })
    .then(function (data) {
      if (data) callback(data);
    }) // redirect
    .catch(function (err) {
      errCallback();

      if (err.name === "AbortError") {
        console.log("Request aborted");
        errCallback("Request timed out! Please try again.");
      }

      console.error(err, err.error);
    });

  var timeoutInMilliSeconds = timeoutInS * 1000;

  setTimeout(function () {
    if (!signal.aborted) controller.abort();
  }, timeoutInMilliSeconds);
}

function redirect(url) {
  if (win.location) win.location = url;
}

function makePayment(url, planId, errCallback) {
  var requestBody = {
    id: planId,
  };

  var redirectToResponseUrl = function (data) {
    redirect(data.url);
  };

  var stopBtnSpinner = function () {
    runBtnSpinner(paymentBtn, false);
  };

  var timeoutInSeconds = 60;

  if (win.fetch) var post = postWithFetch;
  else var post = postWithXhr;

  post(
    url,
    requestBody,
    timeoutInSeconds,
    function (data) {
      redirectToResponseUrl(data);
      stopBtnSpinner();
      disablePriceSelectionDropdown(changePlanBtn, false);
      showErrorBanner("", null, true); // reset
    },
    errCallback
  );
}

// --------- Spinner stuff ---------

function runBtnSpinner(btnElm, show) {
  var btnText = btnElm.querySelector(".js-spinner-text");
  var btnSpinnerContainer = btnElm.querySelector(".js-spinner-container");

  if (show === true) {
    disableBtn(btnElm);
    btnSpinnerContainer.style.display = "inline";
    btnText.style.display = "none";
  }

  if (show === false) {
    disableBtn(btnElm, false);
    btnSpinnerContainer.style.display = "none";
    btnText.style.display = "block";
  }
}

// --------- Error banner stuff ---------

function showBanner(bannerElm, bannerMsg, showClass) {
  bannerElm.innerText = bannerMsg;
  bannerElm.classList.add(showClass);
}

function hideBanner(bannerElm, showClass) {
  bannerElm.classList.remove(showClass);
}

//! find a better name for this function
function showErrorBanner(bannerMsg, showClass, isSrOnly) {
  if (typeof bannerMsg !== "string")
    bannerMsg = "Something went wrong! Please try again.";
  if (typeof showClass !== "string") showClass = "fade-scale";
  if (typeof isSrOnly !== "boolean") isSrOnly = false;

  var errorBanner = query(".js-error-banner");
  var bannerShowDuration = 2500;

  if (isSrOnly) {
    hideBanner(errorBanner, showClass);
    return (errorBanner.innerText = bannerMsg);
  }

  showBanner(errorBanner, bannerMsg, showClass);

  setTimeout(function () {
    hideBanner(errorBanner, showClass);
  }, bannerShowDuration);
}

// --------- Dropdown list stuff ---------

var initialPlanId = 3;
var planId = initialPlanId;

// I know I shoulda fetch this 👇. But, I didn't wanna configure fetch and xhr functions in order do that.
// Also, since the subscription plan details data here and on the server is stale, It's kinda unnecessary.

var planDetailsData = [
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

function changePlanOnSelection(changePlanObj) {
  var radioLabel = changePlanObj.controlElm.nextElementSibling;
  var labelText = radioLabel.innerText;

  for (var i = 0; i < changePlanObj.planDetailsArr.length; i++) {
    var planDetailsObj = changePlanObj.planDetailsArr[i];

    if (planDetailsObj.name === labelText) {
      changePlanObj.planNameElm.innerText = labelText + " Plan";
      changePlanObj.planPriceElm.innerText = "₹" + planDetailsObj.price;
      changePlanObj.planTimeframeElm.innerText = planDetailsObj.timeFrame;

      planId = planDetailsObj.id;
    }
  }
}

function giveRadioFocus(radioElm) {
  radioElm.focus();
}

function giveFocusToSelectedRadio(radioElms) {
  for (let i = 0; i < radioElms.length; i++) {
    const radioElm = radioElms[i];
    if (radioElm.checked) giveRadioFocus(radioElm);
  }
}

function disablePriceSelectionDropdown(dropdownCtrlElm, disable) {
  if (disable == null) disable = true;
  disableBtn(dropdownCtrlElm, disable);
}

// --------- Event listeners ---------

var btns = queryAll("button");

win.onload = function () {
  if (!btns) return;

  for (var i = 0; i < btns.length; i++) {
    var btn = btns[i];
    disableBtn(btn, false);
  }
};

var heroImgElm = query(".js-hero-img");

heroImg.onload = function () {
  if (heroImgElm) setBackgroundImg(heroImgElm, imgSource);
};

var paymentBtn = query(".js-payment-btn");
var changePlanBtn = query(".js-change-plan-btn");

if (paymentBtn) {
  paymentBtn.onclick = function (e) {
    createRipple(e);
  };
}

var form = query(".js-form");

if (form && paymentBtn) {
  form.onsubmit = function (e) {
    e.preventDefault();
    runBtnSpinner(paymentBtn, true);
    disablePriceSelectionDropdown(changePlanBtn, true);
    showErrorBanner(
      "Redirecting to payment page. Don't refresh the page",
      null,
      true
    );

    var baseUrl = "https://order-summary-page.herokuapp.com";
    // var baseUrl = "http://localhost:3000"; // dev-local
    var route = "/create-checkout-session";

    makePayment(baseUrl + route, planId, function (errMsg) {
      runBtnSpinner(paymentBtn, false);
      disableBtn(paymentBtn, false);
      disablePriceSelectionDropdown(changePlanBtn, false);
      errMsg ? showErrorBanner(errMsg) : showErrorBanner();
    });
  };
}

var planDropdown = query(".js-plan-dropdown");
var planOverlay = query(".js-plan-dropdown-overlay");
var radioDropdownLists = queryAll(".js-plan-radio");

function toggleDropdown() {
  toggleDropdownVisibility(changePlanBtn, planDropdown, planOverlay);
}

changePlanBtn.onclick = function () {
  toggleDropdown();
  giveFocusToSelectedRadio(radioDropdownLists);
};

var radioElms = queryAll(".js-plan-radio");
var planTitle = query(".js-plan-title");
var planPrice = query(".js-plan-price-amt");
var planTimeframe = query(".js-plan-timeframe");

for (var j = 0; j < radioElms.length; j++) {
  var radioElm = radioElms[j];

  radioElm.onchange = function () {
    changePlanOnSelection({
      controlElm: this,
      planNameElm: planTitle,
      planPriceElm: planPrice,
      planTimeframeElm: planTimeframe,
      planDetailsArr: planDetailsData,
    });
  };

  radioElm.onkeyup = function (e) {
    if (e.key === "Escape" || e.keyCode === 27) toggleDropdown();
  };

  radioElm.onkeydown = function (e) {
    if (e.key === "Tab" || e.keyCode === 9) toggleDropdown();
  };
}

planOverlay.onclick = toggleDropdown;

win.onerror = function () {
  showErrorBanner("some error has occurred");
  console.error("error on load");
};
