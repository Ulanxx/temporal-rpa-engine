import axios from 'axios';
import { Workflow, WorkflowNode, WorkflowEdge } from '../types';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface CreateWorkflowRequest {
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface UpdateWorkflowRequest {
  name?: string;
  description?: string;
  nodes?: WorkflowNode[];
  edges?: WorkflowEdge[];
}

export interface ExecuteWorkflowRequest {
  workflowId: string;
  input?: Record<string, any>;
}

export const workflowApi = {
  // 工作流管理
  getAllWorkflows: async () => {
    const response = await apiClient.get('/workflows');
    return response.data as Workflow[];
  },
  
  getWorkflow: async (id: string) => {
    const response = await apiClient.get(`/workflows/${id}`);
    return response.data as Workflow;
  },
  
  createWorkflow: async (workflow: CreateWorkflowRequest) => {
    const response = await apiClient.post('/workflows', workflow);
    return response.data as Workflow;
  },
  
  updateWorkflow: async (id: string, workflow: UpdateWorkflowRequest) => {
    const response = await apiClient.put(`/workflows/${id}`, workflow);
    return response.data as Workflow;
  },
  
  deleteWorkflow: async (id: string) => {
    const response = await apiClient.delete(`/workflows/${id}`);
    return response.data;
  },
  
  // 工作流执行
  executeWorkflow: async (id: string, input?: Record<string, any>) => {
    const response = await apiClient.post(`/workflows/${id}/execute`, { input });
    return response.data;
  },
  
  getWorkflowExecutions: async (id: string) => {
    const response = await apiClient.get(`/workflows/${id}/executions`);
    return response.data;
  },
  
  getExecution: async (executionId: string) => {
    const response = await apiClient.get(`/workflows/executions/${executionId}`);
    return response.data;
  },
  
  getWorkflowStatus: async (executionId: string) => {
    const response = await apiClient.get(`/workflows/executions/${executionId}/status`);
    return response.data;
  },
  
  cancelWorkflow: async (executionId: string) => {
    const response = await apiClient.post(`/workflows/executions/${executionId}/cancel`);
    return response.data;
  },
};
