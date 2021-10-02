function createRipple(event) {
  const button = event.currentTarget;
  const circle = document.createElement("span");
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;
  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${event.clientX - (button.offsetLeft + radius)}px`;
  circle.style.top = `${event.clientY - (button.offsetTop + radius)}px`;
  circle.classList.add("ripple");

  button.appendChild(circle);
  circle.addEventListener("animationend", () => button.removeChild(circle));
}

const paymentBtn = document.getElementsByClassName("payment-btn")[0];
paymentBtn.addEventListener("click", createRipple);
