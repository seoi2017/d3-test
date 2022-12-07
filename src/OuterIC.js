import { useSafeState, useToggle, useUpdateEffect } from 'ahooks';
import * as d3 from 'd3';
import { useD3 } from './hooks';

const margin = ({ top: 0, right: 0, bottom: 10, left: 0 });
const height = 500;
const width = 1000;
const m = 58;
const n = 5;

const bumps = m => {
  const values = [];

  for (let i = 0; i < m; ++i) {
    values[i] = 0.1 + 0.1 * Math.random();
  }

  for (let j = 0; j < 5; ++j) {
    const x = 1 / (0.1 + Math.random());
    const y = 2 * Math.random() - 0.5;
    const z = 10 / (0.1 + Math.random());
    for (let i = 0; i < m; i++) {
      const w = (i / m - y) * z;
      values[i] += x * Math.exp(-w * w);
    }
  }

  for (let i = 0; i < m; ++i) {
    values[i] = Math.max(0, values[i]);
  }

  return values;
};

const xAxis = svg => svg.append("g")
  .attr("transform", `translate(0,${height - margin.bottom})`)
  .call(d3.axisBottom(x).tickSizeOuter(0).tickFormat(() => ""));

const yz = d3.range(n).map(() => bumps(m));
const xz = d3.range(m);
const y01z = d3.stack()
  .keys(d3.range(n))
  (d3.transpose(yz))
  .map((data, i) => data.map(([y0, y1]) => [y0, y1, i]));
const y1Max = d3.max(y01z, y => d3.max(y, d => d[1]));
const yMax = d3.max(yz, y => d3.max(y));

const z = d3.scaleSequential(d3.interpolateBlues)
  .domain([-0.5 * n, 1.5 * n]);

const y = d3.scaleLinear()
  .domain([0, y1Max])
  .range([height - margin.bottom, margin.top]);

const x = d3.scaleBand()
  .domain(xz)
  .rangeRound([margin.left, width - margin.right])
  .padding(0.08);

const Chart = () => {
  const [layout, layoutCtrl] = useToggle('stacked', 'grouped');

  const chartRef = useD3(svg => {
    const rect = svg.selectAll("g")
      .data(y01z)
      .join("g")
      .attr("fill", (d, i) => z(i))
      .selectAll("rect")
      .data(d => d)
      .join("rect")
      .attr("x", (d, i) => x(i))
      .attr("y", height - margin.bottom)
      .attr("width", x.bandwidth())
      .attr("height", 0);

    svg.append("g")
      .call(xAxis);

    y.domain([0, y1Max]);

    rect.transition()
      .duration(500)
      .delay((d, i) => i * 20)
      .attr("y", d => y(d[1]))
      .attr("height", d => y(d[0]) - y(d[1]))
      .transition()
      .attr("x", (d, i) => x(i))
      .attr("width", x.bandwidth());
  });

  useUpdateEffect(() => {
    const rect = d3.select(chartRef.current)
      .selectAll("g");

    if (!rect) {
      return;
    } else if (layout === "stacked") {
      y.domain([0, y1Max]);

      rect.transition()
        .duration(500)
        .delay((d, i) => i * 20)
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]))
        .transition()
        .attr("x", (d, i) => x(i))
        .attr("width", x.bandwidth());
    } else {
      y.domain([0, yMax]);

      rect.transition()
        .duration(500)
        .delay((d, i) => i * 20)
        .attr("x", (d, i) => x(i) + x.bandwidth() / n * d[2])
        .attr("width", x.bandwidth() / n)
        .transition()
        .attr("y", d => y(d[1] - d[0]))
        .attr("height", d => y(0) - y(d[1] - d[0]));
    }
  }, [layout]);

  return (
    <>
      <label>
        <input
          type='radio'
          checked={layout === 'stacked'}
          onChange={(e) => e.target.checked && layoutCtrl.setLeft()}
        />
        Stacked Layout
      </label>
      <label>
        <input
          type='radio'
          checked={layout === 'grouped'}
          onChange={(e) => e.target.checked && layoutCtrl.setRight()}
        />
        Grouped Layout
      </label>
      <svg
        ref={chartRef}
        style={{
          height: 1000,
          width: "100%",
          marginRight: "0px",
          marginLeft: "0px",
        }}
      />
    </>
  );
};

export default () => <Chart />;