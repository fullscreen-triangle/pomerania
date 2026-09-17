import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as d3 from "d3";
import { nodes as baseNodes, edges as baseEdges, type GraphNode } from "./data";

type SimNode = GraphNode & d3.SimulationNodeDatum;
type SimEdge = d3.SimulationLinkDatum<SimNode> & { label?: string };

const ACCENT_VAR: Record<NonNullable<GraphNode["accent"]>, string> = {
  k1: "--k1",
  k2: "--k2",
  k3: "--k3",
  k4: "--k4",
};

export default function LandingGraph() {
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const style = getComputedStyle(document.documentElement);
    const col = (v: string) => style.getPropertyValue(v).trim();
    const C = {
      ink: col("--ink"),
      ink2: col("--ink-2"),
      ink3: col("--ink-3"),
      line: col("--line"),
      panel: col("--panel-2"),
      accent: col("--accent"),
    };

    const width = el.clientWidth;
    const height = el.clientHeight;

    const svg = d3
      .select(el)
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    // Subtle field of unconnected dust points to give the single node a
    // sense of a wider space it will grow into, without claiming content
    // that doesn't exist yet.
    const dustCount = 60;
    const dust = d3.range(dustCount).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.4 + 0.4,
    }));
    svg
      .append("g")
      .selectAll("circle")
      .data(dust)
      .join("circle")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", (d) => d.r)
      .attr("fill", C.line)
      .attr("opacity", 0.55);

    const simNodes: SimNode[] = baseNodes.map((n) => ({ ...n }));
    const simEdges: SimEdge[] = baseEdges.map((e) => ({ ...e }));

    const linkGroup = svg.append("g").attr("class", "links");
    const nodeGroup = svg.append("g").attr("class", "nodes");

    const link = linkGroup
      .selectAll("line")
      .data(simEdges)
      .join("line")
      .attr("stroke", C.line)
      .attr("stroke-width", 1.2);

    const nodeSel = nodeGroup
      .selectAll<SVGGElement, SimNode>("g.node")
      .data(simNodes, (d) => d.id)
      .join("g")
      .attr("class", "node")
      .style("cursor", (d) => (d.route ? "pointer" : "default"));

    const radius = (d: SimNode) => (d.kind === "theory" ? 34 : 22);

    nodeSel
      .append("circle")
      .attr("r", radius)
      .attr("fill", C.panel)
      .attr("stroke", (d) => (d.accent ? col(ACCENT_VAR[d.accent]) : C.accent))
      .attr("stroke-width", 2)
      .attr("opacity", (d) => (d.route ? 1 : 0.4));

    nodeSel
      .append("text")
      .text((d) => d.label)
      .attr("text-anchor", "middle")
      .attr("y", (d) => radius(d) + 22)
      .attr("font-size", 14)
      .attr("font-family", "var(--serif)")
      .attr("font-weight", 600)
      .attr("fill", (d) => (d.route ? C.ink : C.ink3))
      .style("pointer-events", "none");

    // hover halo + tooltip-ish summary line beneath the label
    const summary = nodeSel
      .append("text")
      .text((d) => d.summary)
      .attr("text-anchor", "middle")
      .attr("y", (d) => radius(d) + 42)
      .attr("font-size", 11.5)
      .attr("font-family", "var(--mono)")
      .attr("fill", C.ink3)
      .attr("opacity", 0)
      .style("pointer-events", "none")
      .each(function wrap(d) {
        const words = d.summary.split(/\s+/);
        const el = d3.select(this);
        el.text(null);
        const maxCharsPerLine = 42;
        let line: string[] = [];
        let lineNo = 0;
        let tspan = el.append("tspan").attr("x", 0).attr("dy", 0);
        for (const w of words) {
          line.push(w);
          const joined = line.join(" ");
          if (joined.length > maxCharsPerLine) {
            line.pop();
            tspan.text(line.join(" "));
            line = [w];
            lineNo++;
            tspan = el
              .append("tspan")
              .attr("x", 0)
              .attr("dy", 15)
              .text("");
          } else {
            tspan.text(joined);
          }
        }
        void lineNo;
      });

    nodeSel
      .on("mouseenter", function (_e, d) {
        d3.select(this)
          .select("circle")
          .transition()
          .duration(160)
          .attr("r", radius(d) + 4)
          .attr("opacity", 1);
        summary
          .filter((s) => s.id === d.id)
          .transition()
          .duration(160)
          .attr("opacity", d.route ? 1 : 0.6);
      })
      .on("mouseleave", function (_e, d) {
        d3.select(this)
          .select("circle")
          .transition()
          .duration(160)
          .attr("r", radius(d))
          .attr("opacity", d.route ? 1 : 0.4);
        summary
          .filter((s) => s.id === d.id)
          .transition()
          .duration(160)
          .attr("opacity", 0);
      })
      .on("click", (_e, d) => {
        if (!d.route) return;
        if (d.external) window.location.href = d.route;
        else navigate(d.route);
      });

    const sim = d3
      .forceSimulation(simNodes)
      .force(
        "link",
        d3
          .forceLink<SimNode, SimEdge>(simEdges)
          .id((d) => d.id)
          .distance(160)
      )
      .force("charge", d3.forceManyBody().strength(-260))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide(70))
      .on("tick", () => {
        link
          .attr("x1", (d) => (d.source as SimNode).x!)
          .attr("y1", (d) => (d.source as SimNode).y!)
          .attr("x2", (d) => (d.target as SimNode).x!)
          .attr("y2", (d) => (d.target as SimNode).y!);
        nodeSel.attr("transform", (d) => `translate(${d.x},${d.y})`);
      });

    const drag = d3
      .drag<SVGGElement, SimNode>()
      .on("start", (event, d) => {
        if (!event.active) sim.alphaTarget(0.25).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) sim.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    nodeSel.call(drag);

    const handleResize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      svg.attr("viewBox", `0 0 ${w} ${h}`);
      sim.force("center", d3.forceCenter(w / 2, h / 2));
      sim.alpha(0.3).restart();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      sim.stop();
      svg.remove();
    };
  }, [navigate]);

  return <div ref={ref} style={{ width: "100%", height: "100%" }} />;
}
