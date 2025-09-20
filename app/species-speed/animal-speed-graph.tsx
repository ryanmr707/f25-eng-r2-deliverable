/* eslint-disable */
"use client";
import { max } from "d3-array";
import { axisBottom, axisLeft } from "d3-axis"; // D3 is a JavaScript library for data visualization: https://d3js.org/
import { csv } from "d3-fetch";
import { scaleBand, scaleLinear, scaleOrdinal } from "d3-scale";
import { select } from "d3-selection";
import { useEffect, useRef, useState } from "react";

// Example data: Only the first three rows are provided as an example
// Add more animals or change up the style as you desire

// TODO: Write this interface
type Diet = "herbivore" | "omnivore" | "carnivore";
interface AnimalDatum {
  name: string;
  speed: number;
  diet: Diet;
}

const ALLOWED: Diet[] = ["herbivore", "omnivore", "carnivore"];

// limit how many bars we draw so labels are readable
const MAX_BARS = 30;

export default function AnimalSpeedGraph() {
  // useRef creates a reference to the div where D3 will draw the chart.
  // https://react.dev/reference/react/useRef
  const graphRef = useRef<HTMLDivElement>(null);

  const [animalData, setAnimalData] = useState<AnimalDatum[]>([]);

  // TODO: Load CSV data
  useEffect(() => {
    csv("/sample_animals.csv")
      .then((rows) => {
        const data: AnimalDatum[] = rows
          .map((r) => ({
            name: String((r as any).name ?? "").trim(),
            speed: Number((r as any).speed ?? NaN),
            diet: String((r as any).diet ?? "")
              .trim()
              .toLowerCase() as Diet,
          }))
          .filter((d) => d.name && Number.isFinite(d.speed) && ALLOWED.includes(d.diet))
          .sort((a, b) => b.speed - a.speed) // fastest first
          .slice(0, MAX_BARS); // keep top N
        setAnimalData(data);
      })
      .catch((e) => console.error("Failed to load CSV", e));
  }, []);

  useEffect(() => {
    // Clear any previous SVG to avoid duplicates when React hot-reloads
    if (graphRef.current) {
      graphRef.current.innerHTML = "";
    }

    if (animalData.length === 0) return;

    // Set up chart dimensions and margins
    const containerWidth = graphRef.current?.clientWidth ?? 800;
    const containerHeight = graphRef.current?.clientHeight ?? 500;

    // Set up chart dimensions and margins
    const width = Math.max(containerWidth, 600); // Minimum width of 600px
    const height = Math.max(containerHeight, 400); // Minimum height of 400px
    const margin = { top: 70, right: 180, bottom: 110, left: 80 };

    // Create the SVG element where D3 will draw the chart
    // https://github.com/d3/d3-selection
    const svg = select(graphRef.current!).append<SVGSVGElement>("svg").attr("width", width).attr("height", height);

    // TODO: Implement the rest of the graph
    // HINT: Look up the documentation at these links
    // https://github.com/d3/d3-scale#band-scales
    // https://github.com/d3/d3-scale#linear-scales
    // https://github.com/d3/d3-scale#ordinal-scales
    // https://github.com/d3/d3-axis

    const x = scaleBand<string>()
      .domain(animalData.map((d) => d.name))
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const y = scaleLinear()
      .domain([0, (max(animalData, (d) => d.speed) ?? 0) * 1.05])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const color = scaleOrdinal<Diet, string>().domain(ALLOWED).range(["#22c55e", "#eab308", "#ef4444"]);

    // Bars
    svg
      .append("g")
      .selectAll("rect")
      .data(animalData)
      .join("rect")
      .attr("x", (d) => x(d.name)!)
      .attr("y", (d) => y(d.speed))
      .attr("width", x.bandwidth())
      .attr("height", (d) => y(0) - y(d.speed))
      .attr("fill", (d) => color(d.diet)!)
      .append("title")
      .text((d) => `${d.name}\n${d.speed} km/h`);

    // Axes
    const xAxis = axisBottom(x).tickSizeOuter(0);
    const yAxis = axisLeft(y).ticks(8);

    // x-axis with thinned labels (roughly ~12–15 shown)
    const gX = svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis);

    const tickEvery = Math.max(1, Math.floor(animalData.length / 12));
    gX.selectAll("text")
      .attr("transform", "rotate(-35)")
      .style("text-anchor", "end")
      .style("font-size", "10px")
      .attr("dx", "-0.6em")
      .attr("dy", "0.3em")
      .style("display", (_d, i) => (i % tickEvery === 0 ? "block" : "none"));

    const yG = svg.append("g").attr("transform", `translate(${margin.left},0)`).call(yAxis);

    // Axis titles
    yG.append("text")
      .attr("x", 0)
      .attr("y", margin.top - 35)
      .attr("fill", "currentColor")
      .attr("text-anchor", "start")
      .style("font-weight", 600)
      .text("Speed (km/h)");

    svg
      .append("text")
      .attr("x", (width - margin.left - margin.right) / 2 + margin.left)
      .attr("y", height - 14)
      .attr("text-anchor", "middle")
      .attr("fill", "currentColor")
      .style("font-weight", 600)
      .text("Animal");

    // Legend
    const legend = svg
      .append("g")
      .attr("transform", `translate(${width - margin.right + 20}, ${margin.top})`)
      .style("font", "12px sans-serif");

    const items = legend
      .selectAll<SVGGElement, Diet>("g") // ← tell TS each datum is Diet
      .data(ALLOWED) // ← was ["herbivore","omnivore","carnivore"]
      .join("g")
      .attr("transform", (_, i) => `translate(0, ${i * 22})`);

    items
      .append("rect")
      .attr("width", 14)
      .attr("height", 14)
      .attr("rx", 2)
      .attr("fill", (d) => color(d)!); // ← now `d` is Diet, no error

    items
      .append("text")
      .attr("x", 20)
      .attr("y", 11)
      .attr("fill", "currentColor")
      .text((d) => d.slice(0, 1).toUpperCase() + d.slice(1));
  }, [animalData]);

  // TODO: Return the graph
  return <div ref={graphRef} />;
}
