const url =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

const req = new XMLHttpRequest();
const WIDTH = 1200;
const HEIGHT = 600;
const PADDING = 60;

let minYear;
let maxYear;

let baseTemp;
let values = [];

let xScale;
let yScale;

const canvas = d3.select("#canvas");
canvas.attr("width", WIDTH);
canvas.attr("height", HEIGHT);

const tooltip = d3.select("#tooltip");

const generateScales = () => {
  minYear = d3.min(values, (item) => {
    return item["year"];
  });

  maxYear = d3.max(values, (item) => {
    return item["year"];
  });

  xScale = d3
    .scaleLinear()
    .domain([minYear, maxYear + 1])
    .range([PADDING, WIDTH - PADDING]);

  yScale = d3
    .scaleTime()
    .domain([new Date(0, 0, 0, 0, 0, 0, 0), new Date(0, 12, 0, 0, 0, 0, 0)])
    .range([PADDING, HEIGHT - PADDING]);
};

const drawCells = () => {
  canvas
    .selectAll("rect")
    .data(values)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr("fill", (item) => {
      const variance = item["variance"];
      if (variance <= -1) {
        return "SteelBlue";
      } else if (variance <= 0) {
        return "LightSteelBlue";
      } else if (variance <= 1) {
        return "Orange";
      }
      return "Crimson";
    })
    .attr("data-year", (item) => {
      return item["year"];
    })
    .attr("data-month", (item) => {
      return item["month"] - 1;
    })
    .attr("data-temp", (item) => {
      return baseTemp + item["variance"];
    })
    .attr("height", (HEIGHT - 2 * PADDING) / 12)
    .attr("y", (item) => {
      return yScale(new Date(0, item["month"] - 1, 0, 0, 0, 0, 0));
    })
    .attr("width", (item) => {
      const numberOfYears = maxYear - minYear;
      return (WIDTH - 2 * PADDING) / numberOfYears;
    })
    .attr("x", (item) => {
      return xScale(item["year"]);
    })
    .on("mouseover", (item) => {
      tooltip.transition().style("visibility", "visible");
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      tooltip.text(
        `${item["year"]} ${monthNames[item["month"] - 1]} - ${
          baseTemp + item["variance"]
        }°C`
      );
      tooltip.attr("data-year", item["year"]);
    })
    .on("mouseout", (item) => {
      tooltip.transition().style("visibility", "hidden");
    });
};

const drawAxes = () => {
  const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));

  canvas
    .append("g")
    .call(xAxis)
    .attr("transform", `translate(0, ${HEIGHT - PADDING})`)
    .attr("id", "x-axis");

  const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat("%B"));

  canvas
    .append("g")
    .call(yAxis)
    .attr("transform", `translate(${PADDING}, 0)`)
    .attr("id", "y-axis");
};

req.open("GET", url, true);
req.onload = () => {
  const object = JSON.parse(req.responseText);
  baseTemp = object["baseTemperature"];
  values = object["monthlyVariance"];

  generateScales();
  drawCells();
  drawAxes();
};
req.send();
