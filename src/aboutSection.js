export function aboutSection() {
  function textPlusLink(text, { link, linkText }) {
    var flex = document.createElement("div");
    flex.classList.add("content-line");
    var title = document.createTextNode(text);
    var a = document.createElement("a");
    a.setAttribute("target", "_blank");
    var linkTextNode = document.createTextNode(linkText);
    a.appendChild(linkTextNode);
    a.title = link;
    a.href = link;
    flex.append(title);
    flex.appendChild(a);
    return flex;
  }
  var aboutBox = document.getElementById("about");
  aboutBox.addEventListener("click", event => {
    var aboutContent = document.getElementById("about-content");
    // If a link was clicked, do nothing
    if (event.target.nodeName === "A") return;
    else if (aboutContent) {
      aboutContent.parentNode.removeChild(aboutContent);
      aboutBox.classList.add("selectable");
    } else {
      aboutBox.style.setProperty("padding", "5px 0px");
      aboutBox.classList.remove("selectable");
      var aboutContent = document.createElement("div");
      aboutContent.id = "about-content";
      aboutContent.append(
        textPlusLink("Developed By: Remi Marchand", {
          link: "https://remimstr.com",
          linkText: "website"
        })
      );
      aboutContent.append(
        textPlusLink("Data From: John Hopkins", {
          link: "https://github.com/CSSEGISandData/COVID-19",
          linkText: "github"
        })
      ),
        aboutContent.append(
          textPlusLink("Visualization: Echarts", {
            link: "https://www.echartsjs.com/en/index.html",
            linkText: "website"
          })
        );
      aboutBox.append(aboutContent);
    }
  });
}
