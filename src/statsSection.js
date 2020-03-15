function makeCasesLine(title, num) {
  var flex = document.createElement("div");
  flex.classList.add("content-line");
  var title = document.createTextNode(title);
  var countDiv = document.createElement("div");
  countDiv.classList.add("right-item");
  var count = document.createTextNode(num);
  countDiv.appendChild(count);
  flex.append(title);
  flex.append(countDiv);
  return flex;
}

export function statsSection({ name, confirmed, recovered, deaths }) {
  var statsSection = document.getElementById("stats");
  var statsContent = document.getElementById("stats-content");
  if (
  	statsSection &&
    name &&
    typeof confirmed === "number" &&
    typeof recovered === "number" &&
    typeof deaths === "number"
  ) {
    if (statsContent) {
      statsContent.parentNode.removeChild(statsContent);
    }
    var statsContent = document.createElement("div");
    statsContent.id = "stats-content";
    var content = document.createElement("div");
    content.classList.add("content");
    var title = document.createElement("h4");
    title.id = "stats-title";
    name = document.createTextNode(name);
    title.appendChild(name);
    statsContent.appendChild(title);

    content.appendChild(makeCasesLine("Confirmed", confirmed));
    content.appendChild(makeCasesLine("Recovered", recovered));
    content.appendChild(makeCasesLine("Deaths", deaths));
    statsContent.appendChild(content);
    statsSection.append(statsContent);
  }
}
