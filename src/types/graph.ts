// 그래프 노드 및 메타데이터 타입
export interface GraphNode {
  id?: string;
  labels: string[];
  properties: Record<string, any>;
}

export interface GraphMetadata {
  id: string;
  title: string;
  universe?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  // 유니버스 노드 필드
  name?: string;
  created_at?: number;
  detail_description?: string;
  play_time?: string;
  protagonist_desc?: string;
  protagonist_name?: string;
  representative_image?: string;
  setting?: string;
  synopsis?: string;
  twisted_synopsis?: string;
  universe_id?: string;
}

export interface UploadedGraphData {
  nodes: GraphNode[];
  relationships?: Array<{
    source: string;
    target: string;
    type: string;
    properties?: Record<string, any>;
  }>;
}

