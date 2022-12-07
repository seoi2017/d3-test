import { useCreation, useSafeState, useUpdateEffect } from 'ahooks';
import * as d3 from 'd3';
import { useD3 } from './hooks';
import _ from 'lodash';

const margin = ({ top: 20, right: 0, bottom: 30, left: 40 });
const height = 500;
const width = 1000;

const Chart = ({ data }) => {
  const y = useCreation(() => d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)]).nice()
    .range([height - margin.bottom, margin.top]), [data]);

  const x = useCreation(() => d3.scaleBand()
    .domain(data.map(d => d.name))
    .range([margin.left, width - margin.right])
    .padding(0.1), [data]);

  const chartRef = useD3(svg => {
    const yAxis = g => g
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .call(g => g.select(".domain").remove());

    const xAxis = g => g
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0));

    svg.call(svg => {
      const extent = [[margin.left, margin.top], [width - margin.right, height - margin.top]];

      const zoomed = event => {
        x.range([margin.left, width - margin.right].map(d => event.transform.applyX(d)));
        svg.selectAll(".bars rect").attr("x", d => x(d.name)).attr("width", x.bandwidth());
        svg.selectAll(".x-axis").call(xAxis);
      }

      svg.call(d3.zoom()
        .scaleExtent([1, 8])
        .translateExtent(extent)
        .extent(extent)
        .on("zoom", zoomed));
    });

    svg.append("g")
      .attr("class", "bars")
      .attr("fill", "steelblue")
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", d => x(d.name))
      .attr("y", d => y(d.value))
      .attr("height", d => y(0) - y(d.value))
      .attr("width", x.bandwidth());

    svg.append("g")
      .attr("class", "x-axis")
      .call(xAxis);

    svg.append("g")
      .attr("class", "y-axis")
      .call(yAxis);
  }, []);

  useUpdateEffect(() => {
    const svg = d3.select(chartRef.current);

    svg.select('g')
      .selectAll('rect')
      .data(data)
      .join('rect')
      .transition()
      .attr("y", d => y(d.value))
      .attr("height", d => y(0) - y(d.value));
  }, [data]);

  return (
    <svg
      ref={chartRef}
      style={{
        height: 1000,
        width: "100%",
        marginRight: "0px",
        marginLeft: "0px",
      }}
    />
  );
};

const getData = () => _.map(_.range(26), i => ({ name: String.fromCharCode(65 + i), value: +_.random(true) * 100 }));

// eslint-disable-next-line import/no-anonymous-default-export
export default () => {
  const [data, setData] = useSafeState(getData());

  return (
    <>
      <button onClick={() => setData(getData())}>
        Random Data
      </button>
      <Chart data={data} />
    </>
  );
};