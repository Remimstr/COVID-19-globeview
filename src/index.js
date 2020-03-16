/**
 * The entry point
 */

import echarts from "echarts";
import { scatter3D } from "echarts-gl";
import WorldTopology from "./world.topo.bathy.200401.jpg";
import Starfield from "./starfield.jpg";
import "./serviceWorkerRegistration.js";
import { aboutSection } from "./aboutSection.js";
import { statsSection } from "./statsSection.js";
import { controlsSection } from "./controlsSection.js";
import { returnDataSeries } from "./getData.js";
import "./polyfills.js";
import "./style.css";

const GLOBAL_LABEL = "Global Cases";

function produceOption(data) {
  return {
    visualMap: {
      textStyle: {
        color: "white",
        fontSize: 14
      },
      pieces: [
        { min: 0, max: 10 },
        { min: 10, max: 100 },
        { min: 100, max: 1000, label: "100 - 1k" },
        { min: 1000, max: 10000, label: "1k - 10k" },
        { min: 10000, max: 100000, label: "10k - 100k" },
        { min: 100000, max: 1000000, label: "100k+" }
      ],
      inRange: {
        color: ["#B3D4DC", "#A5BECB", "#2B557A"]
      },
      zlevel: 11
    },
    series: {
      type: "scatter3D",
      coordinateSystem: "globe",
      symbolSize: data => dataScaleCalculation(data[3]),
      label: {
        show: false,
        formatter: () => ""
      },
      itemStyle: {
        color: "darkred",
        opacity: 1
      },
      animation: false,
      blendMode: "source-over",
      data
    }
  };
}

function injectToBaseOption(seriesNames, currentIndex, options) {
  return {
    baseOption: {
      backgroundColor: "#000",
      title: {
        text: "COVID-19 Globe View",
        textStyle: {
          color: "lightgrey"
        }
      },
      timeline: {
        right: 5,
        top: 180,
        bottom: 120,
        width: 55,
        axisType: "category",
        data: seriesNames,
        currentIndex: currentIndex,
        orient: "vertical",
        label: {
          position: -12,
          color: "lightgrey",
          fontSize: 14,
          fontWeight: "bold",
          emphasis: {
            color: "white",
            fontSize: 14,
            fontWeight: "bold"
          }
        },
        controlStyle: {
          itemSize: 24,
          color: "white",
          borderColor: "white"
        }
      },
      globe: {
        viewControl: {
          autoRotate: false
        },
        shading: "realistic",
        baseTexture: WorldTopology,
        heightTexture: WorldTopology,
        displacementScale: 0.04,
        environment: Starfield,
        realisticMaterial: {
          roughness: 0.9
        },
        light: {
          ambient: {
            intensity: 0.8,
            shadow: true
          },
          main: {
            intensity: 0.8
          }
        }
      }
    },
    options
  };
}

function dataScaleCalculation(point) {
  if (point > 0) return Math.max(Math.log2(point) * 3, 5);
  return 0;
}

function searchInDataSet(name, dataSet) {
  if (name === GLOBAL_LABEL) return;
  for (var d of dataSet) {
    if (d.name === name) return d;
  }
}

function buildStatsSection(name, seriesData, index) {
  const reduceSeriesData = seriesData => name =>
    seriesData.reduce((acc, curr) => acc + curr[name], 0);
  const seriesDataReducer = reduceSeriesData(seriesData[index]);

  const confirmed = seriesDataReducer("confirmed");
  const recovered = seriesDataReducer("recovered");
  const deaths = seriesDataReducer("deaths");

  statsSection({ name, confirmed, recovered, deaths });
}

window.addEventListener("load", async () => {
  aboutSection();
  var controls = controlsSection();
  var shouldClick = 0;
  var name = GLOBAL_LABEL;

  try {
    var hoverRadio = controls.querySelectorAll("#hover-radio")[0];
    var clickRadio = controls.querySelectorAll("#click-radio")[0];
    var resetGlobal = controls.querySelectorAll("#global-reset")[0];

    hoverRadio.addEventListener("change", () => (shouldClick = 0));
    clickRadio.addEventListener("change", () => (shouldClick = 1));
    resetGlobal.addEventListener("click", () => {
      name = GLOBAL_LABEL;
      buildStatsSection(name, seriesData, currentIndex);
    });
  } catch {
    //do nothing
  }

  const [seriesNames, seriesData] = await returnDataSeries();
  const currentIndex = seriesNames.length - 1;
  // const globalCases =
  const options = seriesData.map(dataSet => produceOption(dataSet));
  var chart = echarts.init(document.getElementById("app"));
  chart.setOption(injectToBaseOption(seriesNames, currentIndex, options));

  // Build the global cases initially
  buildStatsSection(name, seriesData, currentIndex);

  // Set the global cases on update
  chart.on("timelinechanged", ({ currentIndex }) => {
    const dataFindings = searchInDataSet(name, seriesData[currentIndex]);
    if (dataFindings) statsSection(dataFindings);
    else {
      name = GLOBAL_LABEL;
      buildStatsSection(name, seriesData, currentIndex);
    }
  });
  chart.on("mouseover", e => {
    // Hopefully this is enough to catch most errors
    if (e && e.data && shouldClick === 0) {
      if (e.data.name) name = e.data.name;
      statsSection(e.data);
    }
  });
  chart.on("click", e => {
    if (e && e.data && shouldClick === 1) {
      if (e.data.name) name = e.data.name;
      statsSection(e.data);
    }
  });
  window.onresize = function() {
    chart.resize();
  };
});
