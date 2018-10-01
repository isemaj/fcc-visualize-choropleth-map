import * as d3 from 'd3';

import '../styles/app.scss';

const api = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

const width = 990;
const height = 540;
const padding = 65;

const svg = d3.select('#chart')
  .append('svg')
  .attr('width', width)
  .attr('height', height)

const tooltip = d3.select("body")
  .append('div')
  .attr('id', 'tooltip')

// const legend = d3.select("#chart")
//   .append('rect')
//   .attr('id', 'legend')

document.addEventListener("DOMContentLoaded", (event) => {
  fetch(api)
    .then(res => res.json())
    .then(data => {

      const actualWidth = +svg.attr('width') - (padding * 2);
      const actualHeight = +svg.attr('height') - (padding * 2);
      const baseTemperature = data.baseTemperature;
      const monthlyVariance = data.monthlyVariance;
      const minMonths = d3.min(monthlyVariance, (d) => d.month);
      const maxMonths = d3.max(monthlyVariance, (d) => d.month);
      const minYears = d3.min(monthlyVariance, (d) => d.year);
      const maxYears = d3.max(monthlyVariance, (d) => d.year);

      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const color = ['#FFFFCC', '#FFEDA0', '#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026', '#510018', '#2F0108']
      const num_ticks = Math.floor((data.monthlyVariance.length / 12) / 10);

      let xScale = d3.scaleLinear()
        .domain(d3.extent(monthlyVariance, (d) => d.year))
        .range([padding + 30, width - padding])

      let yScale = d3.scaleBand()
        .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
        .range([padding, height - padding])

      let colorScale = d3.scaleQuantize()
        .domain(d3.extent(monthlyVariance, (d) => d.variance))
        .range(color)

      let xAxis = d3.axisBottom(xScale)
        .ticks(num_ticks)
        .tickFormat(d3.format("d"))
        .tickSizeOuter(0)

      let yAxis = d3.axisLeft(yScale)
        .ticks(months.length)
        .tickSizeOuter(0)
        .tickFormat((year) => {
          let date = new Date(0);
          date.setUTCMonth(year);
          return d3.timeFormat("%B")(date);
        })

      // console.log(colorScale.domain())
      // console.log(colorScale.range())
      // console.log(colorScale.range().length)
      // console.log(colorScale(6.0))

      svg.append('g')
        .call(xAxis)
        .attr('id', 'x-axis')
        .attr('transform', `translate(0, ${height - padding})`)

      d3.select('path')
        .attr('stroke', 0)

      svg.append('g')
        .call(yAxis)
        .attr('id', 'y-axis')
        .attr('transform', `translate(${padding + 30}, 0)`)

      svg.append('g')
        .selectAll('rect')
        .data(monthlyVariance)
        .enter()
        .append('rect')
        .attr('id', 'cell')
        .attr('x', (d) => xScale(d.year))
        .attr('y', (d) => yScale(d.month - 1))
        .attr('width', (d) => actualWidth / (maxYears - minYears))
        .attr('height', actualHeight / 12)
        .attr('fill', (d) => colorScale(d.variance))
        .on('mouseover', (d, i) => {
          tooltip.html(`${months[d.month -1]} ${d.year} <br> Temperature: ${(baseTemperature + d.variance).toFixed(2)} &#8451 <br> Variance: ${d.variance} &#8451`)
            .style('left', d3.event.clientX - 90)
            .style('top', d3.event.clientY - 105)
            .style('opacity', 1)
        })
        .on('mouseout', (d) => {
          tooltip.style('opacity', 0)
        })

        // legend.append('g')
        //   .attr('id', 'legend')
        //   .attr('transform', `translate(0, ${actualHeight})`)

        svg.append('g')
          .attr('id','legend')
          .selectAll('rect')
          .data(color)
          .enter()
          .append('rect')
          .attr('width', 30)
          .attr('height', 30)
          .style('fill', (d, i) => color[i])
          .attr('x', (d,i) => i * 30)
          .attr('transform', `translate(0, ${height - 38})`)
    })
});

