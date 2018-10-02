import * as d3 from 'd3';
import * as topojson from 'topojson-client';

import '../styles/app.scss';

const width = '100%';
const height = 600;

const us_education_data = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json';
const us_county_data = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json';

const body = d3.select("body");
const svg = d3.select('svg'); 
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

  console.log(colorScale.domain())
  console.log(colorScale.range())
  // console.log(data)
  // const test = topojson.feature(data, data.objects.counties).features
  // console.log(test);
  // const test2 = topojson.feature(data, data.objects.counties).features
  // console.log(test2)
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
}