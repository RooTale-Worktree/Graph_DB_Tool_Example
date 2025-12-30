import { GraphSchema, NodeSchema, SchemaChangeLog } from '../types/schema';
import { GraphMetadata, UploadedGraphData } from '../types/graph';
import { PropertyMapping } from '../types/schema';

// Neo4j Graph DB가 있다고 가정하고 API 호출 구조만 정의
// 실제 구현 시 axios 등을 사용하여 백엔드 API 호출

// const API_BASE_URL = '/api'; // 백엔드 API 베이스 URL

// 스키마 관련 API
export const schemaApi = {
  // 스키마 조회
  getSchema: async (): Promise<GraphSchema> => {
    // TODO: 실제 API 호출
    // const response = await fetch(`${API_BASE_URL}/schema`);
    // return response.json();
    
    // Mock 데이터 - universe, scene, relation
    return {
      nodeSchemas: [
        {
          nodeType: 'universe',
          properties: [
            { name: 'name', type: 'string', required: true },
            { name: 'title', type: 'string', required: true },
            { name: 'description', type: 'string', required: false },
            { name: 'detail_description', type: 'string', required: false },
            { name: 'representative_image', type: 'string', required: false },
            { name: 'play_time', type: 'string', required: false },
            { name: 'protagonist_name', type: 'string', required: false },
            { name: 'protagonist_desc', type: 'string', required: false },
            { name: 'setting', type: 'string', required: false },
            { name: 'synopsis', type: 'string', required: false },
            { name: 'twisted_synopsis', type: 'string', required: false },
            { name: 'universe_id', type: 'string', required: false },
            { name: 'created_at', type: 'number', required: false },
          ],
        },
        {
          nodeType: 'scene',
          properties: [
            { name: 'title', type: 'string', required: true },
            { name: 'description', type: 'string', required: true },
            { name: 'node_id', type: 'string', required: false },
            { name: 'phase', type: 'string', required: false },
            { name: 'purpose', type: 'string', required: false },
            { name: 'setting', type: 'string', required: false },
            { name: 'characters', type: 'string', required: false },
            { name: 'character_state', type: 'string', required: false },
            { name: 'created_at', type: 'number', required: false },
          ],
        },
        {
          nodeType: 'relation',
          properties: [
            { name: 'choice_text', type: 'string', required: true },
            { name: 'result_text', type: 'string', required: true },
            { name: 'type', type: 'string', required: false },
            { name: 'weight', type: 'number', required: false },
            { name: 'properties', type: 'object', required: false },
          ],
        },
      ],
    };
  },

  // 스키마 업데이트
  updateSchema: async (schema: GraphSchema): Promise<void> => {
    // TODO: 실제 API 호출
    // await fetch(`${API_BASE_URL}/schema`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(schema),
    // });
    console.log('Schema updated:', schema);
  },

  // 스키마 변경 로그 조회
  getSchemaChangeLogs: async (): Promise<SchemaChangeLog[]> => {
    // TODO: 실제 API 호출
    // const response = await fetch(`${API_BASE_URL}/schema/logs`);
    // return response.json();
    
    // Mock 데이터 - 로컬 스토리지에서 가져오거나 빈 배열 반환
    const storedLogs = localStorage.getItem('schema_change_logs');
    return storedLogs ? JSON.parse(storedLogs) : [];
  },

  // 스키마 변경 로그 추가
  addSchemaChangeLog: async (log: Omit<SchemaChangeLog, 'id' | 'timestamp'>): Promise<void> => {
    // TODO: 실제 API 호출
    // await fetch(`${API_BASE_URL}/schema/logs`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(log),
    // });
    
    // 로컬 스토리지에 저장 (실제 구현 시 백엔드에 저장)
    const logs = await schemaApi.getSchemaChangeLogs();
    const newLog: SchemaChangeLog = {
      ...log,
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    logs.unshift(newLog);
    // 최근 100개만 유지
    const recentLogs = logs.slice(0, 100);
    localStorage.setItem('schema_change_logs', JSON.stringify(recentLogs));
  },

  // 노드 타입별 스키마 조회
  getNodeSchema: async (nodeType: string): Promise<NodeSchema | null> => {
    const schema = await schemaApi.getSchema();
    return schema.nodeSchemas.find(s => s.nodeType === nodeType) || null;
  },
};

// 그래프 업로드 관련 API
export const graphApi = {
  // 그래프 업로드 (프로퍼티 매핑 포함)
  uploadGraph: async (
    data: UploadedGraphData,
    mappings: PropertyMapping[]
  ): Promise<void> => {
    // TODO: 실제 API 호출
    // await fetch(`${API_BASE_URL}/graph/upload`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ data, mappings }),
    // });
    console.log('Graph uploaded:', { data, mappings });
  },

  // 프로퍼티 자동 매핑 제안
  suggestMappings: async (
    uploadedProperties: string[],
    nodeType: string
  ): Promise<PropertyMapping[]> => {
    const schema = await schemaApi.getNodeSchema(nodeType);
    if (!schema) return [];

    // 간단한 매핑 제안 로직 (실제로는 더 정교한 알고리즘 사용)
    return uploadedProperties.map(prop => {
      const matched = schema.properties.find(
        s => s.name.toLowerCase() === prop.toLowerCase()
      );
      return {
        sourceProperty: prop,
        targetProperty: matched?.name || prop,
        nodeType,
      };
    });
  },
};

// 메타데이터 관련 API
export const metadataApi = {
  // 메타데이터 조회
  getMetadata: async (id: string): Promise<GraphMetadata> => {
    // TODO: 실제 API 호출
    // const response = await fetch(`${API_BASE_URL}/metadata/${id}`);
    // return response.json();
    
    // Mock 데이터 - 실제 유니버스 노드 구조 반영
    return {
      id,
      title: '월담리: 달빛 아래 숨겨진 혈통',
      name: '월담리: 달빛 아래 숨겨진 혈통',
      universe: 'Sample Universe',
      description: '한적한 산골 마을에 숨겨진 늑대인간의 비밀과 인간 사이의 감정적 갈등을 그린 신비로운 이야기',
      detail_description: '월담리는 대한민국 남부 깊은 산골에 위치한 전통이 살아있는 평화로운 마을입니다...',
      play_time: '40분',
      protagonist_name: '강우진',
      protagonist_desc: '27세의 늑대인간 남자로, 키가 크고 날카로운 눈매를 가진 강인한 외모입니다...',
      representative_image: 'https://cdn.midjourney.com/dda1c5f9-757f-4001-a3f8-981b9360e4c2/0_2.png',
      created_at: 1764688869627,
      universe_id: '4d354ae0-7997-4fd1-b7d1-ec225c89010d',
    };
  },

  // 메타데이터 업데이트 (쿼리 없이)
  updateMetadata: async (
    id: string,
    updates: Partial<GraphMetadata>
  ): Promise<void> => {
    // TODO: 실제 API 호출
    // await fetch(`${API_BASE_URL}/metadata/${id}`, {
    //   method: 'PATCH',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(updates),
    // });
    console.log('Metadata updated:', { id, updates });
  },

  // 유니버스 목록 조회
  getUniverses: async (): Promise<string[]> => {
    // TODO: 실제 API 호출
    // const response = await fetch(`${API_BASE_URL}/metadata/universes`);
    // return response.json();
    
    // Mock 데이터 - 5개 유니버스
    return [
      '월담리: 달빛 아래 숨겨진 혈통',
      '신비로운 마법의 세계',
      '미래 도시 사이버펑크',
      '고대 신화의 영웅들',
      '우주 탐험 시대'
    ];
  },

  // 유니버스별 메타데이터 목록 조회 (유니버스 노드만 반환)
  getMetadataByUniverse: async (universe: string): Promise<GraphMetadata[]> => {
    // TODO: 실제 API 호출
    // const response = await fetch(`${API_BASE_URL}/metadata/universe/${universe}`);
    // return response.json();
    
    // Mock 데이터 - 각 유니버스마다 하나의 유니버스 노드 반환
    const universeNodeMap: Record<string, GraphMetadata> = {
      '월담리: 달빛 아래 숨겨진 혈통': {
        id: '4:afbfbbb5-58c1-49dc-8faf-8de6d72bfbc8:41',
        title: '월담리: 달빛 아래 숨겨진 혈통',
        name: '월담리: 달빛 아래 숨겨진 혈통',
        universe: universe,
        description: '한적한 산골 마을에 숨겨진 늑대인간의 비밀과 인간 사이의 감정적 갈등을 그린 신비로운 이야기',
        detail_description: '월담리는 대한민국 남부 깊은 산골에 위치한 전통이 살아있는 평화로운 마을입니다. 밤마다 산에서 내려오는 짙은 안개가 마을을 감싸며 신비로운 분위기를 자아내고, 달이 깊어질 때 산짐승이 사람의 말을 한다는 오랜 전설이 전해집니다.',
        play_time: '40분',
        protagonist_name: '강우진',
        protagonist_desc: '27세의 늑대인간 남자로, 키가 크고 날카로운 눈매를 가진 강인한 외모입니다. 평소에는 무척 차분하고 과묵하며, 책임감이 강해 주변을 조용히 지키는 성향입니다.',
        representative_image: 'https://cdn.midjourney.com/dda1c5f9-757f-4001-a3f8-981b9360e4c2/0_2.png',
        created_at: 1764688869627,
        universe_id: '4d354ae0-7997-4fd1-b7d1-ec225c89010d',
      },
      '신비로운 마법의 세계': {
        id: '4:magic-world-001:42',
        title: '신비로운 마법의 세계',
        name: '신비로운 마법의 세계',
        universe: universe,
        description: '마법과 현대 기술이 공존하는 판타지 세계',
        detail_description: '마법사와 기술자가 함께 살아가는 독특한 세계관으로, 고대 마법의 힘과 첨단 기술이 융합된 문명을 다룹니다.',
        play_time: '60분',
        protagonist_name: '엘리나',
        protagonist_desc: '젊은 마법사이자 기술자로, 두 세계를 연결하는 역할을 합니다.',
        created_at: 1764688869628,
        universe_id: 'magic-world-uuid-001',
      },
      '미래 도시 사이버펑크': {
        id: '4:cyberpunk-001:43',
        title: '미래 도시 사이버펑크',
        name: '미래 도시 사이버펑크',
        universe: universe,
        description: '2099년 네온으로 가득한 디스토피아 도시',
        detail_description: '거대 기업이 지배하는 미래 도시에서 사이버펑크 기술과 인간성의 경계를 탐구합니다.',
        play_time: '90분',
        protagonist_name: '렉스',
        protagonist_desc: '사이버네틱 강화를 받은 전직 해커로, 시스템에 맞서 싸웁니다.',
        created_at: 1764688869629,
        universe_id: 'cyberpunk-uuid-001',
      },
      '고대 신화의 영웅들': {
        id: '4:mythology-001:44',
        title: '고대 신화의 영웅들',
        name: '고대 신화의 영웅들',
        universe: universe,
        description: '그리스 로마 신화를 배경으로 한 영웅들의 모험',
        detail_description: '고대 신화의 영웅들이 현대에 깨어나 새로운 모험을 시작하는 이야기입니다.',
        play_time: '50분',
        protagonist_name: '아테나',
        protagonist_desc: '지혜의 여신으로 현대 세계에서 새로운 역할을 찾아갑니다.',
        created_at: 1764688869630,
        universe_id: 'mythology-uuid-001',
      },
      '우주 탐험 시대': {
        id: '4:space-001:45',
        title: '우주 탐험 시대',
        name: '우주 탐험 시대',
        universe: universe,
        description: '인류가 우주로 진출한 먼 미래의 탐험 이야기',
        detail_description: '인류가 태양계를 넘어 다른 별들을 탐험하며 새로운 문명과 만나는 SF 스토리입니다.',
        play_time: '120분',
        protagonist_name: '제임스',
        protagonist_desc: '우주선 선장으로, 미지의 행성들을 탐험하며 인류의 새로운 가능성을 찾습니다.',
        created_at: 1764688869631,
        universe_id: 'space-uuid-001',
      },
    };

    const node = universeNodeMap[universe];
    return node ? [node] : [];
  },

  // 모든 유니버스 노드 조회
  getAllUniverseNodes: async (): Promise<GraphMetadata[]> => {
    // TODO: 실제 API 호출
    // const response = await fetch(`${API_BASE_URL}/metadata/universe-nodes`);
    // return response.json();
    
    // Mock 데이터 - 모든 유니버스 노드 반환
    const universes = await metadataApi.getUniverses();
    const allNodes: GraphMetadata[] = [];
    
    for (const universe of universes) {
      const nodes = await metadataApi.getMetadataByUniverse(universe);
      allNodes.push(...nodes);
    }
    
    return allNodes;
  },

  // 유니버스 삭제
  deleteUniverse: async (universe: string): Promise<void> => {
    // TODO: 실제 API 호출
    // await fetch(`${API_BASE_URL}/metadata/universe/${universe}`, {
    //   method: 'DELETE',
    // });
    console.log('Universe deleted:', universe);
  },
};

// 이미지 업로드 관련 API
export const imageApi = {
  // S3에 이미지 업로드
  uploadImage: async (file: File): Promise<string> => {
    // TODO: 실제 API 호출
    // const formData = new FormData();
    // formData.append('image', file);
    // const response = await fetch(`${API_BASE_URL}/images/upload`, {
    //   method: 'POST',
    //   body: formData,
    // });
    // const data = await response.json();
    // return data.url;
    
    // Mock 데이터 - 실제로는 S3 업로드 후 URL 반환
    // 임시로 로컬 파일 URL 생성 (실제 구현 시 S3 URL 반환)
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Mock: 실제로는 S3 업로드 후 URL 반환
        const mockUrl = `https://s3.amazonaws.com/your-bucket/images/${Date.now()}_${file.name}`;
        console.log('Image uploaded (mock):', mockUrl);
        resolve(mockUrl);
      };
      reader.readAsDataURL(file);
    });
  },

  // 이미지 삭제
  deleteImage: async (imageUrl: string): Promise<void> => {
    // TODO: 실제 API 호출
    // await fetch(`${API_BASE_URL}/images/delete`, {
    //   method: 'DELETE',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ url: imageUrl }),
    // });
    console.log('Image deleted:', imageUrl);
  },
};

