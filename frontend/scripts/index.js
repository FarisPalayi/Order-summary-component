// Hero Image stuff

var heroImgElm = document.querySelector(".js-hero-img");

var imgSource = "../images/illustration-hero.svg";
var heroImg = new Image(); // creates a new html img element
heroImg.src = imgSource;

function showHeroImg(imgElm, imgSrc) {
  imgElm.style.backgroundImage = "url(" + imgSrc + ")";
  imgElm.style.opacity = "1";
}

heroImg.onload = function () {
  showHeroImg(heroImgElm, imgSource);
};

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

var paymentBtn = document.querySelector(".js-payment-btn");
paymentBtn.onclick = createRipple;

paymentBtn.addEventListener("click", () =>
  fetch("http://localhost:3000/create-checkout-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      items: [
        {
          id: 1,
          quantity: 2,
        },
      ],
    }),
  })
    .then((res) => {
      if (res.ok) return res.json();
      return res.json().then((err) => Promise.reject(err));
    })
    .then(({ url }) => {
      // window.location = url;
      console.log(url);
    })
    .catch((error) => console.log(error))
);
