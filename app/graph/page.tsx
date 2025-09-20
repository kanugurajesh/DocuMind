'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { GraphVisualization } from '@/components/graph/GraphVisualization';
import { GraphData } from '@/types';
import axios from 'axios';
import { showToast } from '@/lib/toast';

export default function GraphPage() {
  const { user, isLoaded } = useUser();
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [filters, setFilters] = useState({
    entityTypes: [] as string[],
    maxNodes: 100,
  });

  // Load graph data
  useEffect(() => {
    if (isLoaded && user) {
      fetchGraphData();
    }
  }, [isLoaded, user, filters]);

  const fetchGraphData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filters.entityTypes.length > 0) {
        params.append('entityTypes', filters.entityTypes.join(','));
      }
      if (filters.maxNodes) {
        params.append('maxNodes', filters.maxNodes.toString());
      }

      const response = await axios.get(`/api/graph?${params.toString()}`);

      if (response.data.success) {
        setGraphData(response.data.data);
        setError(null);
      } else {
        throw new Error(response.data.error || 'Failed to load graph data');
      }
    } catch (error: any) {
      console.error('Error fetching graph data:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to load graph data';
      setError(errorMsg);
      showToast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const triggerEntityClustering = async () => {
    try {
      setLoading(true);
      showToast.loading('Clustering entities...');
      const response = await axios.post('/api/graph/cluster');

      if (response.data.success) {
        showToast.dismiss();
        showToast.success('Entity clustering completed!');
        // Refresh graph data after clustering
        await fetchGraphData();
      } else {
        throw new Error(response.data.error || 'Failed to cluster entities');
      }
    } catch (error: any) {
      console.error('Error clustering entities:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to cluster entities';
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
      showToast.loading('Analyzing document similarity...');
      const response = await axios.post('/api/graph/similarity');

      if (response.data.success) {
        showToast.dismiss();
        showToast.success('Document similarity analysis completed!');
        // Refresh graph data after similarity analysis
        await fetchGraphData();
      } else {
        throw new Error(response.data.error || 'Failed to analyze document similarity');
      }
    } catch (error: any) {
      console.error('Error analyzing document similarity:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to analyze document similarity';
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
      showToast.loading('Extracting topics...');
      const response = await axios.post('/api/graph/topics');

      if (response.data.success) {
        showToast.dismiss();
        showToast.success('Topic extraction completed!');
        // Refresh graph data after topic modeling
        await fetchGraphData();
      } else {
        throw new Error(response.data.error || 'Failed to extract topics');
      }
    } catch (error: any) {
      console.error('Error extracting topics:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to extract topics';
      setError(errorMsg);
      showToast.dismiss();
      showToast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = (nodeId: string, nodeType: string) => {
    if (graphData) {
      const node = graphData.nodes.find(n => n.id === nodeId);
      setSelectedNode(node);
    }
  };

  const handleEdgeClick = (edgeId: string) => {
    console.log('Edge clicked:', edgeId);
  };

  const toggleEntityTypeFilter = (entityType: string) => {
    setFilters(prev => ({
      ...prev,
      entityTypes: prev.entityTypes.includes(entityType)
        ? prev.entityTypes.filter(t => t !== entityType)
        : [...prev.entityTypes, entityType],
    }));
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h1>
          <p className="text-gray-600 mb-6">Please sign in to view your knowledge graph.</p>
          <a
            href="/sign-in"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Knowledge Graph</h1>
            <p className="text-gray-600 mt-1">
              Visualize relationships between your documents, entities, and concepts
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Cluster Entities */}
            <button
              onClick={triggerEntityClustering}
              disabled={loading}
              className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-4l3 3-3 3M9 8l3 3-3 3" />
              </svg>
              <span>Cluster Entities</span>
            </button>

            {/* Document Similarity */}
            <button
              onClick={triggerDocumentSimilarity}
              disabled={loading}
              className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Analyze Doc Similarity</span>
            </button>

            {/* Topic Modeling */}
            <button
              onClick={triggerTopicModeling}
              disabled={loading}
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span>Extract Topics</span>
            </button>

            {/* Refresh */}
            <button
              onClick={fetchGraphData}
              disabled={loading}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>

            {/* Back to Dashboard */}
            <a
              href="/dashboard"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Back to Dashboard
            </a>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto flex-shrink-0 text-red-400 hover:text-red-600"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>

              {/* Entity Type Filters */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Entity Types</h4>
                <div className="space-y-2">
                  {['PERSON', 'ORGANIZATION', 'LOCATION', 'DATE', 'MONEY', 'OTHER'].map(type => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.entityTypes.includes(type)}
                        onChange={() => toggleEntityTypeFilter(type)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">{type.toLowerCase()}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Max Nodes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Nodes
                </label>
                <select
                  value={filters.maxNodes}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxNodes: parseInt(e.target.value) }))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                  <option value={500}>500</option>
                </select>
              </div>

              {/* Graph Stats */}
              {graphData && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Graph Statistics</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>Nodes: {graphData.nodes.length}</div>
                    <div>Edges: {graphData.edges.length}</div>
                    <div>Documents: {graphData.nodes.filter(n => n.type === 'Document').length}</div>
                    <div>Entities: {graphData.nodes.filter(n => n.type === 'Entity').length}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Selected Node Info */}
            {selectedNode && (
              <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Node Details</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Type:</strong> {selectedNode.type}</div>
                  <div><strong>ID:</strong> {selectedNode.id}</div>
                  {selectedNode.type === 'Document' && (
                    <div><strong>Filename:</strong> {selectedNode.filename}</div>
                  )}
                  {selectedNode.type === 'Entity' && (
                    <>
                      <div><strong>Name:</strong> {selectedNode.name}</div>
                      <div><strong>Category:</strong> {selectedNode.category}</div>
                    </>
                  )}
                  {selectedNode.type === 'Chunk' && (
                    <div><strong>Index:</strong> {selectedNode.chunkIndex}</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Graph Visualization */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              {loading ? (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your knowledge graph...</p>
                  </div>
                </div>
              ) : !graphData || (graphData.nodes.length === 0) ? (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Data to Visualize</h3>
                    <p className="text-gray-600 mb-4">
                      Upload and process some documents to see your knowledge graph.
                    </p>
                    <a
                      href="/dashboard"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}