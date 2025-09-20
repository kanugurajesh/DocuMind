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
}: GraphVisualizationProps) {
  const cyRef = useRef<HTMLDivElement>(null);
  const cyInstanceRef = useRef<Core | null>(null);
  const [loading, setLoading] = useState(true);
  const [_selectedNode, setSelectedNode] = useState<string | null>(null);

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

    // Transform data for Cytoscape
    const elements = [
      // Nodes
      ...graphData.nodes.map((node) => ({
        data: {
          ...node,
          label: getNodeLabel(node),
        },
      })),
      // Edges
      ...graphData.edges.map((edge) => ({
        data: {
          ...edge,
          id: `${edge.startNodeId}-${edge.endNodeId}`,
          source: edge.startNodeId,
          target: edge.endNodeId,
          label: edge.type,
        },
      })),
    ];

    // Initialize Cytoscape
    const cy = cytoscape({
      container: cyRef.current,
      elements,
      style: [
        // Node styles
        {
          selector: "node",
          style: {
            "background-color": "#666",
            label: "data(label)",
            "text-valign": "center",
            "text-halign": "center",
            "font-size": "12px",
            "font-weight": "bold",
            "text-outline-width": 2,
            "text-outline-color": "#fff",
            width: "60px",
            height: "60px",
          },
        },
        // Document nodes
        {
          selector: 'node[type="Document"]',
          style: {
            "background-color": "#3B82F6",
            width: "80px",
            height: "80px",
            "font-size": "14px",
          },
        },
        // Chunk nodes
        {
          selector: 'node[type="Chunk"]',
          style: {
            "background-color": "#10B981",
            width: "50px",
            height: "50px",
            "font-size": "10px",
          },
        },
        // Entity nodes
        {
          selector: 'node[type="Entity"]',
          style: {
            "background-color": "#8B5CF6",
            width: "65px",
            height: "65px",
            "font-size": "12px",
          },
        },
        // Person entities
        {
          selector: 'node[type="Entity"][category="PERSON"]',
          style: {
            "background-color": "#F59E0B",
            shape: "round-rectangle",
          },
        },
        // Organization entities
        {
          selector: 'node[type="Entity"][category="ORGANIZATION"]',
          style: {
            "background-color": "#EF4444",
            shape: "round-rectangle",
          },
        },
        // Location entities
        {
          selector: 'node[type="Entity"][category="LOCATION"]',
          style: {
            "background-color": "#06B6D4",
            shape: "round-rectangle",
          },
        },
        // Topic nodes
        {
          selector: 'node[type="Topic"]',
          style: {
            "background-color": "#9333EA",
            width: "70px",
            height: "70px",
            "font-size": "11px",
            shape: "hexagon",
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
        // Edge styles
        {
          selector: "edge",
          style: {
            width: 2,
            "line-color": "#9CA3AF",
            "target-arrow-color": "#9CA3AF",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
            label: "data(label)",
            "font-size": "10px",
            "text-rotation": "autorotate",
            "text-margin-y": -10,
          },
        },
        // CONTAINS relationships
        {
          selector: 'edge[type="CONTAINS"]',
          style: {
            "line-color": "#3B82F6",
            "target-arrow-color": "#3B82F6",
            width: 3,
          },
        },
        // MENTIONS relationships
        {
          selector: 'edge[type="MENTIONS"]',
          style: {
            "line-color": "#8B5CF6",
            "target-arrow-color": "#8B5CF6",
            width: 2,
          },
        },
        // COOCCURS_WITH relationships
        {
          selector: 'edge[type="COOCCURS_WITH"]',
          style: {
            "line-color": "#F59E0B",
            "target-arrow-color": "#F59E0B",
            width: "data(count)",
            opacity: "data(confidence)" as any,
          },
        },
        // SIMILAR_TO relationships
        {
          selector: 'edge[type="SIMILAR_TO"]',
          style: {
            "line-color": "#06B6D4",
            "target-arrow-color": "#06B6D4",
            width: 2,
            opacity: "data(similarity)" as any,
          },
        },
        // SAME_AS relationships
        {
          selector: 'edge[type="SAME_AS"]',
          style: {
            "line-color": "#DC2626",
            "target-arrow-color": "#DC2626",
            width: 3,
            "line-style": "dashed",
          },
        },
        // DOCUMENT_SIMILAR_TO relationships
        {
          selector: 'edge[type="DOCUMENT_SIMILAR_TO"]',
          style: {
            "line-color": "#059669",
            "target-arrow-color": "#059669",
            width: "mapData(similarity, 0, 1, 2, 5)",
            opacity: "data(similarity)" as any,
            "line-style": "dotted",
          },
        },
        // CATEGORIZES relationships
        {
          selector: 'edge[type="CATEGORIZES"]',
          style: {
            "line-color": "#9333EA",
            "target-arrow-color": "#9333EA",
            width: "mapData(relevance, 0, 1, 2, 4)",
            opacity: "data(relevance)" as any,
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
        animationDuration: 1000,
        fit: true,
        padding: 50,
        nodeDimensionsIncludeLabels: true,
        idealEdgeLength: 100,
        edgeElasticity: 0.45,
        nestingFactor: 0.1,
        gravity: 0.4,
        numIter: 2500,
        tile: true,
        tilingPaddingVertical: 10,
        tilingPaddingHorizontal: 10,
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

    cyInstanceRef.current = cy;
    setLoading(false);

    // Cleanup
    return () => {
      if (cyInstanceRef.current) {
        cyInstanceRef.current.destroy();
        cyInstanceRef.current = null;
      }
    };
  }, [graphData, onNodeClick, onEdgeClick, getNodeLabel]);


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

      {/* Legend */}
      <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Legend</h4>

        {/* Node Types */}
        <div className="mb-4">
          <h5 className="text-xs font-medium text-gray-700 mb-2">Node Types</h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span>Documents</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span>Text Chunks</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
              <span>Entities</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span>People</span>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className="w-4 h-4 bg-purple-600"
                style={{
                  clipPath:
                    "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
                }}
              ></div>
              <span>Topics</span>
            </div>
          </div>
        </div>

        {/* Relationship Types */}
        <div>
          <h5 className="text-xs font-medium text-gray-700 mb-2">
            Relationships
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-0.5 bg-blue-500"></div>
              <span>Contains</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-0.5 bg-purple-500"></div>
              <span>Mentions</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-0.5 bg-yellow-500"></div>
              <span>Co-occurs</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-0.5 bg-cyan-500"></div>
              <span>Similar</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-0.5 bg-red-500 border-dashed border-t"></div>
              <span>Same Entity</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-0.5 bg-emerald-600 border-dotted border-t"></div>
              <span>Doc Similarity</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-0.5 bg-purple-600"></div>
              <span>Categorizes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
