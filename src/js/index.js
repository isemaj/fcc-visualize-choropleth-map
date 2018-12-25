import * as d3 from 'd3';
import * as topojson from 'topojson-client';

import '../styles/app.scss';

const width = '100%';
const height = 600;

const us_education_data = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json';
const us_county_data = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json';

const body = d3.select("body");
const svg = d3.select('svg'); 
const legend = svg.append('g')
  .attr('id', 'legend')
  .attr('transform', 'translate(170,30)')
const path = d3.geoPath();

svg.attr('width', width)
  .attr('height', height)

const tooltip = body.append('div')
  .attr('id', 'tooltip')
  .style('opacity', 0)

const files = [us_education_data, us_county_data];
const promises = [];

files.forEach((url) => promises.push(d3.json(url)))

Promise.all(promises)
  .then((res) => ready(res))
  .then((err) => readError(err))

const readError = (err) => {
  if (err) throw err;
}

const ready = (res) => {
  const data = res[1]
  const min = d3.min(res[0], (d) => d.bachelorsOrHigher);
  const max = d3.max(res[0], (d) => d.bachelorsOrHigher);
  const step = (max - min) / 8;

  const colorScale = d3.scaleThreshold()
    .domain(d3.range(min, max, step))
    .range(d3.schemeReds[9])
  const colorRange = colorScale.range();
  console.log(colorScale.domain())
  console.log(colorScale.range())

  const axisLabel = d3.scaleLinear()
    .domain([min, max])
    .rangeRound([600, 860])

  svg.append('g')
    .attr('class', 'counties')
    .attr('transform', 'translate(170, 0)')
    .selectAll('path')
    .data(topojson.feature(data, data.objects.counties).features)
    .enter()
    .append('path')
    .attr('class', 'county')
    .attr('d', path)
    .attr('fill', (d) => {
      let result = res[0].filter((i) => {
        return i.fips === d.id
      })
      if (result[0]) {
        return colorScale(result[0].bachelorsOrHigher)
      }
      return colorScale(0)
    })
    .attr('data-fips', (d) => d.id)
    .attr('data-education', (d) => {
      let result = res[0].filter((i) => {
        return i.fips === d.id
      })
      if(result[0]) {
        return result[0].bachelorsOrHigher
      }
    })
    .on('mouseover', (d, i) => {
      tooltip.style('opacity', 0.7)
        .html(() => {
          let result = res[0].filter((i) => {
            return i.fips === d.id
          })
          if(result[0]) {
            return  `${result[0].area_name}, ${result[0].state} <br> ${result[0].bachelorsOrHigher}%` 
          }
        })
        .style('left', d3.event.pageX + 10)
        .style('top', d3.event.pageY - 40)
    })
    .on('mouseout', (d) => {
      tooltip.style('opacity', 0)
    })

  legend.selectAll('rect')
    .data(colorScale.range().map((d) => {
      d = colorScale.invertExtent(d);
      if (d[0] == null) d[0] = axisLabel.domain()[0];
      if (d[1] == null) d[1] = axisLabel.domain()[1];
      return d;
    }))
    .enter()
    .append('rect')
    .attr('height', 20)
    .attr('x', (d) => axisLabel(d[0]))
    .attr('width', (d) => axisLabel(d[1]) - axisLabel(d[0]))
    .attr('fill', (d,i) => colorRange[i])

    let axis = d3.axisBottom(axisLabel)
      .tickValues(colorScale.domain())
      .tickFormat((x, i) => Math.round(x) + '%')
      .tickSize(30)
      .tickSizeOuter(0)

    legend.append('g')
      .call(axis)
}