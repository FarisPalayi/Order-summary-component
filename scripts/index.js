function createRipple(event) {
  var button = event.currentTarget;
  var circle = document.createElement("span");
  var diameter = Math.max(button.clientWidth, button.clientHeight);
  var radius = diameter / 2;

  circle.style.width = circle.style.height = diameter + "px";
  circle.style.left = event.clientX - (button.offsetLeft + radius) + "px";
  circle.style.top = event.clientY - (button.offsetTop + radius) + "px";
  circle.classList.add("ripple");

  button.appendChild(circle);
  circle.addEventListener("animationend", function () {
    button.removeChild(circle);
  });
}

var paymentBtn = document.getElementsByClassName("payment-btn")[0];
paymentBtn.addEventListener("click", createRipple);