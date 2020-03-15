export function controlsSection() {
  var controls = document.getElementById("controls");
  if (controls) {
    var controlSection = document.createElement("div");
    controlSection.id = "controls-section";

    var radios = document.createElement("span");
    var hoverText = document.createTextNode("Hover");
    var hoverRadio = document.createElement("input");
    hoverRadio.id = "hover-radio";
    hoverRadio.setAttribute("checked", "checked");
    hoverRadio.setAttribute("type", "radio");
    hoverRadio.setAttribute("name", "controls");

    var clickText = document.createTextNode("Click");
    var clickRadio = document.createElement("input");
    clickRadio.id = "click-radio";
    clickRadio.setAttribute("type", "radio");
    clickRadio.setAttribute("name", "controls");

    radios.appendChild(hoverText);
    radios.appendChild(hoverRadio);
    radios.appendChild(clickText);
    radios.appendChild(clickRadio);

    var globalButton = document.createElement("Button");
    globalButton.id = "global-reset";
    globalButton.innerHTML = "Reset to Global";

    controlSection.appendChild(radios);
    controlSection.appendChild(globalButton);
    controls.append(controlSection);
    return controls;
  }
}
