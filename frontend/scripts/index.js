// --------- Utils ---------

var doc = document,
  win = window,
  query = function (selector) {
    return doc.querySelector(selector);
  },
  queryAll = function (selector) {
    return doc.querySelectorAll(selector);
  };

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
    },
    errCallback
  );
}

// --------- Spinner stuff ---------

function runBtnSpinner(btnElm, show) {
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

// --------- Error banner stuff ---------

function showErrorBanner(bannerMsg) {
  if (typeof bannerMsg !== "string")
    bannerMsg = "Something went wrong! Please try again.";

  var errorBanner = query(".js-error-banner");
  var bannerShowDuration = 2500;

  errorBanner.innerText = bannerMsg;
  errorBanner.classList.add("fade-scale");

  setTimeout(function () {
    errorBanner.classList.remove("fade-scale");
  }, bannerShowDuration);
}

// --------- Dropdown list stuff ---------

var initialPlanId = 3;
var planId = initialPlanId;

var planDetailsData = [
  { id: 1, name: "Weekly", price: 99, timeFrame: "week" },
  { id: 2, name: "Monthly", price: 399, timeFrame: "month" },
  { id: 3, name: "Annual", price: 3999, timeFrame: "year" },
]; // I know I shoulda fetch this. But, I didn't wanna configure fetch and xhr functions in order do that.

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
  planNameElm,
  planPriceElm,
  planTimeframeElm,
  planDetailsArr
) {
  var radioLabel = controlElm.nextElementSibling;
  var labelText = radioLabel.innerText;

  for (var i = 0; i < planDetailsArr.length; i++) {
    var planDetailsObj = planDetailsArr[i];

    if (planDetailsObj.name === labelText) {
      planNameElm.innerText = labelText + " Plan";
      planPriceElm.innerText = "₹" + planDetailsObj.price;
      planTimeframeElm.innerText = planDetailsObj.timeFrame;

      planId = planDetailsObj.id;
    }
  }
}

function giveRadioFocus(radioElm) {
  radioElm.focus();
}

// --------- Event listeners ---------

var btns = queryAll("button");

win.onload = function () {
  if (!btns) return;

  for (var i = 0; i < btns.length; i++) {
    var btn = btns[i];
    btn.disabled = false;
  }
};

var heroImgElm = query(".js-hero-img");

heroImg.onload = function () {
  if (heroImgElm) setBackgroundImg(heroImgElm, imgSource);
};

var paymentBtn = query(".js-payment-btn");

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

    var baseUrl = "https://order-summary-page.herokuapp.com";
    // var baseUrl = "http://localhost:3000"; // dev-local
    var route = "/create-checkout-session";

    makePayment(baseUrl + route, planId, function (errMsg) {
      runBtnSpinner(paymentBtn, false);
      paymentBtn.disabled = false;
      errMsg ? showErrorBanner(errMsg) : showErrorBanner();
    });
  };
}

var changePlanBtn = query(".js-change-plan-btn");
var planDropdown = query(".js-plan-dropdown");
var planOverlay = query(".js-plan-dropdown-overlay");

function toggleDropdown() {
  toggleDropdownVisibility(changePlanBtn, planDropdown, planOverlay);
}

changePlanBtn.onclick = function () {
  toggleDropdown();

  queryAll(".js-plan-radio").forEach((elm) => {
    if (elm.checked) giveRadioFocus(elm);
  });
};

var radioElms = queryAll(".js-plan-radio");
var planTitle = query(".js-plan-title");
var planPrice = query(".js-plan-price-amt");
var planTimeframe = query(".js-plan-timeframe");

for (var j = 0; j < radioElms.length; j++) {
  var radioElm = radioElms[j];

  radioElm.onchange = function () {
    changePlanOnSelection(
      this,
      planTitle,
      planPrice,
      planTimeframe,
      planDetailsData
    );
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
