const url =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

const colors = [
  "#000000",
  "#000033",
  "#000099",
  "#0000ff",
  "#6666ff",
  "#ccccff",
  "#b3ffcc",
  "#4dff88",
  "#00b33c",
  "#ffff00",
  "#ff6633",
  "#b32d00",
  "#ff3300",
];

const tooltip = d3.select("body").append("div").attr("id", "tooltip");

const width = 850;
const height = 500;
const margin = { top: 110, right: 100, bottom: 130, left: 100 };
let baseTemp;
let monthlyVariance = [];

const formatMonths = (d) => {
  const months = [
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
  return months[d - 1];
};

const fillColor = (d) => {
  const color = Math.floor(d["baseTemperature"] + d["variance"]);
  return colors[color];
};

const svg = d3.select("#canvas");

svg
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);

d3.json(url).then((data, error) => {
  if (error) console.log(error);

  let baseTemp = data["baseTemperature"];
  let monthlyVariance = data["monthlyVariance"];

  const minYear = d3.min(monthlyVariance, (item) => {
    return item["year"];
  });

  const maxYear = d3.max(monthlyVariance, (item) => {
    return item["year"];
  });

  const xScale = d3
    .scaleLinear()
    .domain([minYear, maxYear + 1])
    .range([0, width]);

  const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));

  const yScale = d3
    .scaleBand()
    .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
    .range([0, height])
    .round(0, 0);

  const yAxis = d3
    .axisLeft(yScale)
    .tickValues(yScale.domain())
    .tickFormat((month) => formatMonths(month))
    .tickSize(5, 0);

  svg
    .append("g")
    .attr("id", "x-axis")
    .attr("transform", `translate(${margin.left}, ${height + margin.top})`)
    .call(xAxis);

  svg
    .append("g")
    .attr("id", "y-axis")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
    .call(yAxis);

  const cellWidth = width / (maxYear - minYear);
  const cellHeight = height / 12;

  svg
    .selectAll("rect")
    .data(data["monthlyVariance"])
    .enter()
    .append("rect")
    .attr("height", cellHeight)
    .attr("width", cellWidth)
    .attr("x", (d) => xScale(d["year"]))
    .attr("y", (d) => (d["month"] - 1) * cellHeight)
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
    .attr("class", "cell")
    .attr("data-month", (d) => [d["month"] - 1])
    .attr("data-year", (d) => d["year"])
    .attr("data-temp", (d) => baseTemp + d["variance"])
    .attr("fill", (d) =>
      fillColor({
        baseTemperature: baseTemp,
        variance: d["variance"],
      })
    )
    .on("mousemove", (d, i) => {
      tooltip
        .attr("data-year", d["year"])
        .style("display", "inline-block")
        .style("left", d3.event.pageX + 15 + "px")
        .style("top", d3.event.pageY - 110 + "px").html(`
            Year: ${parseInt(d["year"], 10)}<br />
            Temperature: ${data["baseTemperature"] - d["variance"]}°C<br />
            Variance: ${d["variance"]}°C
            `);
    })
    .on("mouseout", (d) => {
      tooltip.style("display", "none");
    });
});

svg
  .append("text")
  .text("Monthly Global Land-Surface Temperature 1753 - 2015")
  .attr("x", margin.left + 20)
  .attr("y", 50)
  .attr("id", "title");

svg
  .append("text")
  .text(
    "Temperatures are in Celsius and are reported as abnormalities based on an avergae of 8.66°C between 1753 and 2015."
  )
  .attr("x", margin.left + 20)
  .attr("y", 75)
  .attr("class", "text")
  .attr("id", "description");

let padding = 0;
const legend = svg
  .append("g")
  .attr("id", "legend")
  .attr("transform", `translate(${margin.left + 20}, ${margin.top + 50})`);

colors.forEach((color, i) => {
  legend
    .append("rect")
    .attr("width", 30)
    .attr("height", 30)
    .attr("x", padding)
    .attr("y", height)
    .style("fill", color);

  legend
    .append("text")
    .text(`${i}°C`)
    .attr("x", padding + 8)
    .attr("y", height + 42)
    .attr("class", "legend-text");

  padding += 30;
});
