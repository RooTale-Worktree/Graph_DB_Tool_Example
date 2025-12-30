// 스키마 타입 정의
export type PropertyType = 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';

export interface PropertyDefinition {
  name: string;
  type: PropertyType;
  required: boolean;
  description?: string;
  defaultValue?: any;
}

export interface NodeSchema {
  nodeType: string; // 'Story', 'Back', 'Chat' 등
  properties: PropertyDefinition[];
}

export interface GraphSchema {
  nodeSchemas: NodeSchema[];
}

// 업로드된 데이터의 프로퍼티 매핑 정보
export interface PropertyMapping {
  sourceProperty: string; // 업로드 파일의 프로퍼티명
  targetProperty: string; // 스키마의 프로퍼티명
  nodeType: string;
}

// 스키마 변경 로그
export interface SchemaChangeLog {
  id: string;
  timestamp: number;
  nodeType: string;
  action: 'add' | 'update' | 'delete' | 'save';
  propertyName?: string;
  description: string;
  changedBy?: string;
}

