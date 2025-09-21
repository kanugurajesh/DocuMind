"use client";

import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { GraphVisualization } from "@/components/graph/GraphVisualization";
import { AppLayout } from "@/components/layout/app-layout";
import { showToast } from "@/lib/toast";
import type { GraphData } from "@/types";

export default function GraphPage() {
  const { user, isLoaded } = useUser();
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [filters, setFilters] = useState({
    entityTypes: [] as string[],
    maxNodes: 100,
    showEdgeLabels: false,
    minConfidence: 0.3,
  });

  const fetchGraphData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filters.entityTypes.length > 0) {
        params.append("entityTypes", filters.entityTypes.join(","));
      }
      if (filters.maxNodes) {
        params.append("maxNodes", filters.maxNodes.toString());
      }

      const response = await axios.get(`/api/graph?${params.toString()}`);

      if (response.data.success) {
        setGraphData(response.data.data);
        setError(null);
      } else {
        throw new Error(response.data.error || "Failed to load graph data");
      }
    } catch (error: any) {
      console.error("Error fetching graph data:", error);
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "Failed to load graph data";
      setError(errorMsg);
      showToast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Load graph data
  useEffect(() => {
    if (isLoaded && user) {
      fetchGraphData();
    }
  }, [isLoaded, user, fetchGraphData]);

  const triggerEntityClustering = async () => {
    try {
      setLoading(true);
      showToast.loading("Clustering entities...");
      const response = await axios.post("/api/graph/cluster");

      if (response.data.success) {
        showToast.dismiss();
        showToast.success("Entity clustering completed!");
        // Refresh graph data after clustering
        await fetchGraphData();
      } else {
        throw new Error(response.data.error || "Failed to cluster entities");
      }
    } catch (error: any) {
      console.error("Error clustering entities:", error);
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "Failed to cluster entities";
      setError(errorMsg);
      showToast.dismiss();
      showToast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const triggerDocumentSimilarity = async () => {
    try {
      setLoading(true);
      showToast.loading("Analyzing document similarity...");
      const response = await axios.post("/api/graph/similarity");

      if (response.data.success) {
        showToast.dismiss();
        showToast.success("Document similarity analysis completed!");
        // Refresh graph data after similarity analysis
        await fetchGraphData();
      } else {
        throw new Error(
          response.data.error || "Failed to analyze document similarity",
        );
      }
    } catch (error: any) {
      console.error("Error analyzing document similarity:", error);
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "Failed to analyze document similarity";
      setError(errorMsg);
      showToast.dismiss();
      showToast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const triggerTopicModeling = async () => {
    try {
      setLoading(true);
      showToast.loading("Extracting topics...");
      const response = await axios.post("/api/graph/topics");

      if (response.data.success) {
        showToast.dismiss();
        showToast.success("Topic extraction completed!");
        // Refresh graph data after topic modeling
        await fetchGraphData();
      } else {
        throw new Error(response.data.error || "Failed to extract topics");
      }
    } catch (error: any) {
      console.error("Error extracting topics:", error);
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "Failed to extract topics";
      setError(errorMsg);
      showToast.dismiss();
      showToast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = (nodeId: string, _nodeType: string) => {
    if (graphData) {
      const node = graphData.nodes.find((n) => n.id === nodeId);
      setSelectedNode(node);
    }
  };

  const handleEdgeClick = (edgeId: string) => {
    console.log("Edge clicked:", edgeId);
  };

  const toggleEntityTypeFilter = (entityType: string) => {
    setFilters((prev) => ({
      ...prev,
      entityTypes: prev.entityTypes.includes(entityType)
        ? prev.entityTypes.filter((t) => t !== entityType)
        : [...prev.entityTypes, entityType],
    }));
  };

  if (!isLoaded) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center card-enhanced p-8 max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-enhanced mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Sign In Required
            </h1>
            <p className="text-gray-600 mb-6 text-lg">
              Please sign in to view your knowledge graph.
            </p>
            <a
              href="/sign-in"
              className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
            >
              Sign In
            </a>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Knowledge Graph
            </h1>
            <p className="text-gray-700 mt-1 text-lg font-semibold">
              Visualize relationships between your documents, entities, and
              concepts
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Cluster Entities */}
            <button
              onClick={triggerEntityClustering}
              disabled={loading}
              className="bg-white border border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 text-sm font-medium flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14-4l3 3-3 3M9 8l3 3-3 3"
                />
              </svg>
              <span>Cluster Entities</span>
            </button>

            {/* Document Similarity */}
            <button
              onClick={triggerDocumentSimilarity}
              disabled={loading}
              className="bg-white border border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 hover:text-green-700 text-sm font-medium flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>Analyze Doc Similarity</span>
            </button>

            {/* Topic Modeling */}
            <button
              onClick={triggerTopicModeling}
              disabled={loading}
              className="bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 text-sm font-medium flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              <span>Extract Topics</span>
            </button>

            {/* Refresh */}
            <button
              onClick={fetchGraphData}
              disabled={loading}
              className="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 text-sm font-medium flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Refresh</span>
            </button>

            {/* Back to Dashboard */}
            <a
              href="/dashboard"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl text-sm font-medium"
            >
              Back to Dashboard
            </a>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 card-enhanced border-l-4 border-l-red-500 bg-gradient-to-r from-red-50 to-pink-50 border-red-200 shadow-lg p-4">
            <div className="flex">
              <svg
                className="h-5 w-5 text-red-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1 font-medium">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto flex-shrink-0 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-lg p-1 transition-colors"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="card-enhanced border-l-4 border-l-purple-500 p-6">
              <h3 className="text-lg font-semibold text-enhanced mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                Filters
              </h3>

              {/* Entity Type Filters */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-blue-700 mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  Entity Types
                </h4>
                <div className="space-y-3">
                  {[
                    "PERSON",
                    "ORGANIZATION",
                    "LOCATION",
                    "DATE",
                    "MONEY",
                    "OTHER",
                  ].map((type) => (
                    <label key={type} className="flex items-center p-2 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.entityTypes.includes(type)}
                        onChange={() => toggleEntityTypeFilter(type)}
                        className="rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-3 text-sm text-gray-800 capitalize font-semibold">
                        {type.toLowerCase()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Max Nodes */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-green-700 mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  Max Nodes
                </label>
                <select
                  value={filters.maxNodes}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      maxNodes: parseInt(e.target.value, 10),
                    }))
                  }
                  className="w-full rounded-lg border-green-300 shadow-sm focus:border-green-500 focus:ring-green-500 bg-white font-medium text-gray-800"
                  style={{ color: '#1f2937' }}
                >
                  <option value={50} style={{ color: '#1f2937', backgroundColor: '#ffffff' }}>50</option>
                  <option value={100} style={{ color: '#1f2937', backgroundColor: '#ffffff' }}>100</option>
                  <option value={200} style={{ color: '#1f2937', backgroundColor: '#ffffff' }}>200</option>
                  <option value={500} style={{ color: '#1f2937', backgroundColor: '#ffffff' }}>500</option>
                </select>
              </div>

              {/* Display Options */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-indigo-700 mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                  Display Options
                </h4>
                <div className="space-y-3">
                  <label className="flex items-center p-2 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.showEdgeLabels}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          showEdgeLabels: e.target.checked,
                        }))
                      }
                      className="rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-3 text-sm text-gray-800 font-semibold">
                      Show Connection Labels
                    </span>
                  </label>
                </div>
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-800 font-medium">
                    💡 <strong>Tip:</strong> Keep labels off for cleaner view. Hover over connections to see their types.
                  </p>
                </div>
              </div>

              {/* Graph Stats */}
              {graphData && (
                <div className="border-t border-orange-200 pt-4">
                  <h4 className="text-sm font-semibold text-orange-700 mb-3 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                    Graph Statistics
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center p-2 rounded-lg bg-blue-50">
                      <span className="font-medium text-blue-700">Nodes:</span>
                      <span className="font-bold text-blue-800">{graphData.nodes.length}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-green-50">
                      <span className="font-medium text-green-700">Edges:</span>
                      <span className="font-bold text-green-800">{graphData.edges.length}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-purple-50">
                      <span className="font-medium text-purple-700">Documents:</span>
                      <span className="font-bold text-purple-800">
                        {
                          graphData.nodes.filter((n) => n.type === "Document")
                            .length
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-orange-50">
                      <span className="font-medium text-orange-700">Entities:</span>
                      <span className="font-bold text-orange-800">
                        {
                          graphData.nodes.filter((n) => n.type === "Entity")
                            .length
                        }
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Selected Node Info */}
            {selectedNode && (
              <div className="card-enhanced border-l-4 border-l-indigo-500 p-6 mt-6">
                <h3 className="text-lg font-semibold text-enhanced mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  Node Details
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center p-2 rounded-lg bg-indigo-50">
                    <span className="font-medium text-indigo-700">Type:</span>
                    <span className="font-bold text-indigo-800">{selectedNode.type}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50">
                    <span className="font-medium text-gray-700">ID:</span>
                    <span className="font-mono text-xs text-gray-600 truncate max-w-32">{selectedNode.id}</span>
                  </div>
                  {selectedNode.type === "Document" && (
                    <div className="flex justify-between items-center p-2 rounded-lg bg-blue-50">
                      <span className="font-medium text-blue-700">Filename:</span>
                      <span className="font-bold text-blue-800 truncate max-w-32">{selectedNode.filename}</span>
                    </div>
                  )}
                  {selectedNode.type === "Entity" && (
                    <>
                      <div className="flex justify-between items-center p-2 rounded-lg bg-green-50">
                        <span className="font-medium text-green-700">Name:</span>
                        <span className="font-bold text-green-800">{selectedNode.name}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-lg bg-purple-50">
                        <span className="font-medium text-purple-700">Category:</span>
                        <span className="font-bold text-purple-800">{selectedNode.category}</span>
                      </div>
                    </>
                  )}
                  {selectedNode.type === "Chunk" && (
                    <div className="flex justify-between items-center p-2 rounded-lg bg-orange-50">
                      <span className="font-medium text-orange-700">Index:</span>
                      <span className="font-bold text-orange-800">{selectedNode.chunkIndex}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Graph Visualization */}
          <div className="lg:col-span-3">
            <div className="card-enhanced border-l-4 border-l-blue-500 p-6">
              {loading ? (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border border-blue-400 opacity-20 mx-auto"></div>
                    </div>
                    <p className="text-gray-700 font-semibold">
                      Loading your knowledge graph...
                    </p>
                  </div>
                </div>
              ) : !graphData || graphData.nodes.length === 0 ? (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center shadow-lg border border-blue-200">
                      <svg
                        className="h-10 w-10 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-enhanced mb-3">
                      No Data to Visualize
                    </h3>
                    <p className="text-gray-700 mb-6 max-w-sm mx-auto font-medium">
                      Upload and process some documents to see your knowledge
                      graph.
                    </p>
                    <a
                      href="/dashboard"
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
                    >
                      Upload Documents
                    </a>
                  </div>
                </div>
              ) : (
                <GraphVisualization
                  graphData={graphData}
                  onNodeClick={handleNodeClick}
                  onEdgeClick={handleEdgeClick}
                  height={600}
                  showEdgeLabels={filters.showEdgeLabels}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
