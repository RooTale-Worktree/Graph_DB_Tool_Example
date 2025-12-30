import { useState, useEffect } from 'react';
import { PropertyMapping } from '../../types/schema';
import { UploadedGraphData } from '../../types/graph';
import { schemaApi, graphApi } from '../../services/api';
import './GraphUploader.css';

export default function GraphUploader() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedData, setUploadedData] = useState<UploadedGraphData | null>(null);
  const [nodeType, setNodeType] = useState<string>('Story');
  const [mappings, setMappings] = useState<PropertyMapping[]>([]);
  const [availableNodeTypes, setAvailableNodeTypes] = useState<string[]>([]);
  const [schemaProperties, setSchemaProperties] = useState<string[]>([]);

  useEffect(() => {
    loadNodeTypes();
  }, []);

  useEffect(() => {
    if (uploadedData && nodeType) {
      generateMappings();
    }
  }, [uploadedData, nodeType]);

  useEffect(() => {
    loadSchemaProperties();
  }, [nodeType]);

  const loadSchemaProperties = async () => {
    try {
      const nodeSchema = await schemaApi.getNodeSchema(nodeType);
      if (nodeSchema) {
        setSchemaProperties(nodeSchema.properties.map(p => p.name));
      } else {
        setSchemaProperties([]);
      }
    } catch (error) {
      console.error('Failed to load schema properties:', error);
      setSchemaProperties([]);
    }
  };

  const loadNodeTypes = async () => {
    try {
      const schema = await schemaApi.getSchema();
      setAvailableNodeTypes(schema.nodeSchemas.map(ns => ns.nodeType));
    } catch (error) {
      console.error('Failed to load node types:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    // JSON 파일 파싱
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content) as UploadedGraphData;
        setUploadedData(data);
      } catch (error) {
        console.error('Failed to parse JSON:', error);
        alert('JSON 파일 파싱에 실패했습니다.');
      }
    };
    reader.readAsText(file);
  };

  const generateMappings = async () => {
    if (!uploadedData || uploadedData.nodes.length === 0) return;

    // 첫 번째 노드의 프로퍼티를 기준으로 매핑 생성
    const firstNode = uploadedData.nodes[0];
    const uploadedProperties = Object.keys(firstNode.properties);

    try {
      const suggestedMappings = await graphApi.suggestMappings(
        uploadedProperties,
        nodeType
      );
      setMappings(suggestedMappings);
    } catch (error) {
      console.error('Failed to generate mappings:', error);
    }
  };

  const handleMappingChange = (
    index: number,
    field: 'sourceProperty' | 'targetProperty',
    value: string
  ) => {
    const updatedMappings = mappings.map((m, i) =>
      i === index ? { ...m, [field]: value } : m
    );
    setMappings(updatedMappings);
  };

  const handleUpload = async () => {
    if (!uploadedData || mappings.length === 0) {
      alert('파일과 매핑 정보를 확인해주세요.');
      return;
    }

    try {
      await graphApi.uploadGraph(uploadedData, mappings);
      alert('그래프가 성공적으로 업로드되었습니다.');
      // 초기화
      setSelectedFile(null);
      setUploadedData(null);
      setMappings([]);
    } catch (error) {
      console.error('Failed to upload graph:', error);
      alert('그래프 업로드에 실패했습니다.');
    }
  };

  return (
    <div className="graph-uploader">
      <div className="uploader-header">
        <h2>그래프 업로드</h2>
        <p className="uploader-description">
          JSON 파일을 업로드하고 프로퍼티 형식을 자동으로 매핑합니다.
          <br />
          스키마에 정의된 형식에 맞춰 프로퍼티가 자동으로 변환됩니다.
        </p>
      </div>

      <div className="upload-section">
        <div className="file-selector">
          <label className="file-label">
            <input
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="file-input"
            />
            <span className="file-button">파일 선택</span>
            {selectedFile && (
              <span className="file-name">{selectedFile.name}</span>
            )}
          </label>
        </div>

        {uploadedData && (
          <div className="node-type-selector">
            <label>
              노드 타입:
              <select
                value={nodeType}
                onChange={(e) => setNodeType(e.target.value)}
                className="node-type-select"
              >
                {availableNodeTypes.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
      </div>

      {uploadedData && mappings.length > 0 && (
        <div className="mapping-section">
          <h3>프로퍼티 매핑</h3>
          <p className="mapping-description">
            업로드된 파일의 프로퍼티를 스키마의 프로퍼티에 매핑합니다.
          </p>

          <div className="mapping-table">
            <div className="mapping-header">
              <span>업로드 파일 프로퍼티</span>
              <span>→</span>
              <span>스키마 프로퍼티</span>
            </div>

            {mappings.map((mapping, index) => (
              <div key={index} className="mapping-row">
                <input
                  type="text"
                  value={mapping.sourceProperty}
                  readOnly
                  className="mapping-input readonly"
                />
                <span className="arrow">→</span>
                <select
                  value={mapping.targetProperty}
                  onChange={(e) =>
                    handleMappingChange(index, 'targetProperty', e.target.value)
                  }
                  className="mapping-select"
                >
                  <option value="">매핑 안 함</option>
                  {schemaProperties.map(prop => (
                    <option key={prop} value={prop}>
                      {prop}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="upload-actions">
            <button className="upload-button" onClick={handleUpload}>
              그래프 업로드
            </button>
          </div>
        </div>
      )}

      {uploadedData && (
        <div className="preview-section">
          <h3>업로드 데이터 미리보기</h3>
          <pre className="preview-json">
            {JSON.stringify(uploadedData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

