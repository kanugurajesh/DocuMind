"use client";

import cytoscape, {
  type Core,
  type EdgeSingular,
  type NodeSingular,
} from "cytoscape";
import coseBilkent from "cytoscape-cose-bilkent";
import { useCallback, useEffect, useRef, useState } from "react";
import type { GraphVisualizationProps } from "@/types";

// Register the layout
if (typeof cytoscape === "function") {
  cytoscape.use(coseBilkent);
}

export function GraphVisualization({
  graphData,
  onNodeClick,
  onEdgeClick,
  height = 600,
  width,
  showEdgeLabels = false,
}: GraphVisualizationProps & { showEdgeLabels?: boolean }) {
  const cyRef = useRef<HTMLDivElement>(null);
  const cyInstanceRef = useRef<Core | null>(null);
  const [loading, setLoading] = useState(true);
  const [_selectedNode, setSelectedNode] = useState<string | null>(null);
  const [legendOpen, setLegendOpen] = useState(false);

  const getNodeLabel = useCallback((node: any) => {
    switch (node.type) {
      case "Document":
        return node.filename || "Document";
      case "Chunk":
        return `Chunk ${node.chunkIndex || ""}`;
      case "Entity":
        return node.name || "Entity";
      case "Topic":
        return node.name || "Topic";
      default:
        return node.id || "Node";
    }
  }, []);

  useEffect(() => {
    if (!cyRef.current || !graphData) return;

    setLoading(true);


    // Compute degree for each node so important entities render larger
    const degreeMap = new Map<string, number>();
    for (const edge of graphData.edges) {
      degreeMap.set(edge.startNodeId, (degreeMap.get(edge.startNodeId) || 0) + 1);
      degreeMap.set(edge.endNodeId, (degreeMap.get(edge.endNodeId) || 0) + 1);
    }

    // Transform data for Cytoscape
    const elements = [
      // Nodes
      ...graphData.nodes.map((node) => ({
        data: {
          ...node,
          label: getNodeLabel(node),
          degree: degreeMap.get(node.id) || 1,
        },
      })),
      // Edges - Now using consistent startNodeId/endNodeId from Neo4j
      ...graphData.edges.map((edge) => ({
        data: {
          ...edge,
          id: `${edge.startNodeId}-${edge.endNodeId}-${edge.type}`,
          source: edge.startNodeId,
          target: edge.endNodeId,
          label: edge.type,
        },
      })),
    ];


    // Validate edges - check for missing source/target nodes
    const nodeIds = new Set(graphData.nodes.map(node => node.id));
    const invalidEdges = graphData.edges.filter(edge =>
      (!nodeIds.has(edge.startNodeId) || !nodeIds.has(edge.endNodeId))
    );



    // Initialize Cytoscape
    const cy = cytoscape({
      container: cyRef.current,
      elements,
      style: [
        // Node styles — base (labels hidden by default for cleaner view)
        {
          selector: "node",
          style: {
            "background-color": "#666",
            label: "",
            "text-valign": "center",
            "text-halign": "center",
            "font-size": "11px",
            "font-weight": "600",
            "text-outline-width": 2,
            "text-outline-color": "#fff",
            color: "#1f2937",
            width: "45px",
            height: "45px",
            shape: "ellipse",
          },
        },
        // Document and Topic nodes always show labels (fewer of them, high-level)
        {
          selector: 'node[type="Document"], node[type="Topic"]',
          style: {
            label: "data(label)",
          },
        },
        // Document nodes
        {
          selector: 'node[type="Document"]',
          style: {
            "background-color": "#3B82F6",
            width: "60px",
            height: "60px",
            "font-size": "12px",
          },
        },
        // Chunk nodes
        {
          selector: 'node[type="Chunk"]',
          style: {
            "background-color": "#10B981",
            width: "32px",
            height: "32px",
          },
        },
        // Entity nodes — scale size by degree (more connections = bigger)
        {
          selector: 'node[type="Entity"]',
          style: {
            "background-color": "#8B5CF6",
            width: "mapData(degree, 1, 12, 32, 64)",
            height: "mapData(degree, 1, 12, 32, 64)",
          },
        },
        // Entity subcategories — color only, circles
        {
          selector: 'node[type="Entity"][category="PERSON"]',
          style: { "background-color": "#F59E0B" },
        },
        {
          selector: 'node[type="Entity"][category="ORGANIZATION"]',
          style: { "background-color": "#EF4444" },
        },
        {
          selector: 'node[type="Entity"][category="LOCATION"]',
          style: { "background-color": "#06B6D4" },
        },
        // Topic nodes
        {
          selector: 'node[type="Topic"]',
          style: {
            "background-color": "#9333EA",
            width: "55px",
            height: "55px",
            "font-size": "11px",
          },
        },
        // Selected node
        {
          selector: "node:selected",
          style: {
            "border-width": 3,
            "border-color": "#FCD34D",
            "border-opacity": 1,
          },
        },
        // Edge styles - Conditional labels
        {
          selector: "edge",
          style: {
            width: 2, // Slightly thinner for less clutter
            "line-color": "#9CA3AF", // Subtle gray color
            "target-arrow-color": "#9CA3AF",
            "target-arrow-shape": "triangle",
            "arrow-scale": 1.2,
            "curve-style": "bezier",
            label: "", // Controlled via separate effect for live updates
            "font-size": "9px",
            "font-weight": "bold",
            "text-outline-width": 2,
            "text-outline-color": "#fff",
            color: "#4B5563",
            opacity: 0.7,
          },
        },
        // Edge styles on hover - Show labels
        {
          selector: "edge:hover",
          style: {
            width: 3,
            "line-color": "#6366F1",
            "target-arrow-color": "#6366F1",
            label: "data(label)",
            "font-size": "10px",
            "font-weight": "bold",
            "text-outline-width": 2,
            "text-outline-color": "#fff",
            color: "#1E293B",
            opacity: 1,
          },
        },
        // Structural edges — light, recede to background
        {
          selector: 'edge[type="CONTAINS"], edge[type="MENTIONS"]',
          style: {
            "line-color": "#CBD5E1",
            "target-arrow-color": "#CBD5E1",
            width: 1.5,
            opacity: 0.6,
          },
        },
        // Semantic edges — meaningful relationships
        {
          selector: 'edge[type="COOCCURS_WITH"], edge[type="SIMILAR_TO"], edge[type="SAME_AS"], edge[type="DOCUMENT_SIMILAR_TO"], edge[type="CATEGORIZES"]',
          style: {
            "line-color": "#6366F1",
            "target-arrow-color": "#6366F1",
            width: 2,
            opacity: 0.75,
            "line-style": "solid",
          },
        },
        // Selected edge
        {
          selector: "edge:selected",
          style: {
            width: 4,
            "line-color": "#FCD34D",
            "target-arrow-color": "#FCD34D",
          },
        },
      ],
      layout: {
        name: "cose-bilkent",
        animate: true,
        animationDuration: 2000,
        fit: true,
        padding: 50, // More padding for breathing room
        nodeDimensionsIncludeLabels: true,
        idealEdgeLength: 120, // Longer edges for better spacing
        edgeElasticity: 0.3, // Less elastic for cleaner layout
        nestingFactor: 0.1,
        gravity: 0.4, // Moderate gravity
        numIter: 4000, // More iterations for better layout
        tile: false,
        randomize: false,
        nodeRepulsion: 8000, // Higher repulsion to prevent overlap
        // Quality settings
        quality: "default",
        step: "all",
        // Additional spacing controls
        gravityRangeCompound: 1.5,
        gravityCompound: 1.0,
        gravityRange: 3.8,
      } as any,
    });

    // Event handlers
    cy.on("tap", "node", (evt) => {
      const node = evt.target as NodeSingular;
      const nodeId = node.id();
      setSelectedNode(nodeId);
      onNodeClick?.(nodeId, node.data("type"));
    });

    cy.on("tap", "edge", (evt) => {
      const edge = evt.target as EdgeSingular;
      const edgeId = edge.id();
      onEdgeClick?.(edgeId);
    });

    // Clear selection when clicking on background
    cy.on("tap", (evt) => {
      if (evt.target === cy) {
        setSelectedNode(null);
        cy.$(":selected").unselect();
      }
    });

    // Show label on hover for Entity and Chunk nodes
    cy.on("mouseover", 'node[type="Entity"], node[type="Chunk"]', (evt) => {
      const node = evt.target as NodeSingular;
      node.style("label", node.data("label"));
    });
    cy.on("mouseout", 'node[type="Entity"], node[type="Chunk"]', (evt) => {
      const node = evt.target as NodeSingular;
      node.style("label", "");
    });

    cyInstanceRef.current = cy;

    // Final verification after rendering
    setTimeout(() => {
      const renderedNodes = cy.nodes().length;
      const renderedEdges = cy.edges().length;
    }, 100);

    setLoading(false);

    // Cleanup
    return () => {
      if (cyInstanceRef.current) {
        cyInstanceRef.current.destroy();
        cyInstanceRef.current = null;
      }
    };
  }, [graphData, onNodeClick, onEdgeClick, getNodeLabel]);

  // Update edge labels on the live instance when the toggle changes — no need to recreate the graph
  useEffect(() => {
    if (!cyInstanceRef.current) return;
    cyInstanceRef.current.edges().style("label", showEdgeLabels ? "data(label)" : "");
    cyInstanceRef.current.edges().style("font-size", "10px");
    cyInstanceRef.current.edges().style("color", "#1E293B");
    cyInstanceRef.current.edges().style("text-outline-width", 2);
    cyInstanceRef.current.edges().style("text-outline-color", "#fff");
  }, [showEdgeLabels]);


  const fitToView = () => {
    if (cyInstanceRef.current) {
      cyInstanceRef.current.fit(undefined, 50);
    }
  };

  const centerGraph = () => {
    if (cyInstanceRef.current) {
      cyInstanceRef.current.center();
    }
  };

  const resetZoom = () => {
    if (cyInstanceRef.current) {
      cyInstanceRef.current.zoom(1);
      cyInstanceRef.current.center();
    }
  };

  return (
    <div className="relative">
      {/* Graph Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
        <button
          onClick={fitToView}
          className="bg-white shadow-md rounded-lg p-2 hover:bg-gray-50 transition-colors"
          title="Fit to view"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            />
          </svg>
        </button>
        <button
          onClick={centerGraph}
          className="bg-white shadow-md rounded-lg p-2 hover:bg-gray-50 transition-colors"
          title="Center graph"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"
            />
          </svg>
        </button>
        <button
          onClick={resetZoom}
          className="bg-white shadow-md rounded-lg p-2 hover:bg-gray-50 transition-colors"
          title="Reset zoom"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
            />
          </svg>
        </button>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading graph...</p>
          </div>
        </div>
      )}

      {/* Graph Container */}
      <div
        ref={cyRef}
        style={{
          height: `${height}px`,
          width: width ? `${width}px` : "100%",
        }}
        className="bg-gray-50 rounded-lg border border-gray-200"
      />

      {/* Legend — compact collapsible strip */}
      <div className="mt-3 border border-gray-200 rounded-lg bg-white shadow-sm">
        <button
          onClick={() => setLegendOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg"
        >
          <span className="flex items-center gap-3">
            <span className="flex gap-1.5 items-center">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" title="Document" />
              <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" title="Entity" />
              <span className="w-3 h-3 rounded-full bg-purple-700 inline-block" title="Topic" />
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block" title="Chunk" />
            </span>
            <span className="text-gray-500 font-normal">Legend</span>
          </span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${legendOpen ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {legendOpen && (
          <div className="px-4 pb-4 pt-1 border-t border-gray-100">
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-700">
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />Document</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />Entity</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" />Person</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" />Organization</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-cyan-500 inline-block" />Location</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-purple-700 inline-block" />Topic</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" />Chunk</div>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-700 mt-2 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-slate-300 inline-block" />Structural (Contains / Mentions)</div>
              <div className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-indigo-500 inline-block" />Semantic (Co-occurs / Similar / Categorizes)</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
