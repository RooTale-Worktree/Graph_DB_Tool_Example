import { useState, useEffect } from 'react';
import { GraphSchema, PropertyDefinition, SchemaChangeLog } from '../../types/schema';
import { schemaApi } from '../../services/api';
import './SchemaManager.css';

export default function SchemaManager() {
  const [schema, setSchema] = useState<GraphSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [changeLogs, setChangeLogs] = useState<SchemaChangeLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    loadSchema();
    loadChangeLogs();
  }, []);

  const loadSchema = async () => {
    try {
      setLoading(true);
      const data = await schemaApi.getSchema();
      setSchema(data);
    } catch (error) {
      console.error('Failed to load schema:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChangeLogs = async () => {
    try {
      const logs = await schemaApi.getSchemaChangeLogs();
      setChangeLogs(logs);
    } catch (error) {
      console.error('Failed to load change logs:', error);
    }
  };

  const handleAddProperty = async (nodeType: string) => {
    if (!schema) return;

    const updatedSchema: GraphSchema = {
      ...schema,
      nodeSchemas: schema.nodeSchemas.map(ns =>
        ns.nodeType === nodeType
          ? {
              ...ns,
              properties: [
                ...ns.properties,
                { name: '', type: 'string' as PropertyDefinition['type'], required: false },
              ],
            }
          : ns
      ),
    };
    setSchema(updatedSchema);
    
    // 로그 기록
    await schemaApi.addSchemaChangeLog({
      nodeType,
      action: 'add',
      description: `${nodeType} 노드에 새 프로퍼티 추가`,
    });
    await loadChangeLogs();
  };

  const handleUpdateProperty = (
    nodeType: string,
    index: number,
    updates: Partial<PropertyDefinition>
  ) => {
    if (!schema) return;

    const updatedSchema = {
      ...schema,
      nodeSchemas: schema.nodeSchemas.map(ns =>
        ns.nodeType === nodeType
          ? {
              ...ns,
              properties: ns.properties.map((p, i) =>
                i === index ? { ...p, ...updates } : p
              ),
            }
          : ns
      ),
    };
    setSchema(updatedSchema);
  };

  const handleDeleteProperty = async (nodeType: string, index: number) => {
    if (!schema) return;

    const property = schema.nodeSchemas
      .find(ns => ns.nodeType === nodeType)
      ?.properties[index];

    const updatedSchema = {
      ...schema,
      nodeSchemas: schema.nodeSchemas.map(ns =>
        ns.nodeType === nodeType
          ? {
              ...ns,
              properties: ns.properties.filter((_, i) => i !== index),
            }
          : ns
      ),
    };
    setSchema(updatedSchema);
    
    // 로그 기록
    await schemaApi.addSchemaChangeLog({
      nodeType,
      action: 'delete',
      propertyName: property?.name,
      description: `${nodeType} 노드에서 프로퍼티 "${property?.name || '알 수 없음'}" 삭제`,
    });
    await loadChangeLogs();
  };

  const handleSaveSchema = async () => {
    if (!schema) return;

    try {
      await schemaApi.updateSchema(schema);
      
      // 로그 기록
      await schemaApi.addSchemaChangeLog({
        nodeType: 'all',
        action: 'save',
        description: '전체 스키마 저장',
      });
      await loadChangeLogs();
      
      alert('스키마가 저장되었습니다.');
    } catch (error) {
      console.error('Failed to save schema:', error);
      alert('스키마 저장에 실패했습니다.');
    }
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  if (!schema) {
    return <div className="error">스키마를 불러올 수 없습니다.</div>;
  }

  return (
    <div className="schema-manager">
      <div className="schema-header">
        <div className="header-top">
          <div>
            <h2>스키마 관리</h2>
            <p className="schema-description">
              각 노드 타입(universe, scene, relation)의 프로퍼티 형식을 정의하고 관리합니다.
              <br />
              스키마 변경 시 모든 파트에 자동으로 반영됩니다.
            </p>
          </div>
          <div className="header-actions">
            <button 
              className="logs-button" 
              onClick={() => setShowLogs(!showLogs)}
            >
              {showLogs ? '로그 숨기기' : '변경 로그 보기'}
            </button>
            <button className="save-button" onClick={handleSaveSchema}>
              스키마 저장
            </button>
          </div>
        </div>
      </div>

      {showLogs && (
        <div className="change-logs-section">
          <h3>스키마 변경 로그</h3>
          <div className="logs-list">
            {changeLogs.length === 0 ? (
              <div className="empty-logs">변경 로그가 없습니다.</div>
            ) : (
              changeLogs.map(log => (
                <div key={log.id} className="log-item">
                  <div className="log-header">
                    <span className={`log-action log-action-${log.action}`}>
                      {log.action === 'add' && '➕ 추가'}
                      {log.action === 'update' && '✏️ 수정'}
                      {log.action === 'delete' && '🗑️ 삭제'}
                      {log.action === 'save' && '💾 저장'}
                    </span>
                    <span className="log-node-type">{log.nodeType}</span>
                    {log.propertyName && (
                      <span className="log-property">{log.propertyName}</span>
                    )}
                    <span className="log-time">
                      {new Date(log.timestamp).toLocaleString('ko-KR')}
                    </span>
                  </div>
                  <div className="log-description">{log.description}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div className="node-schemas">
        {schema.nodeSchemas.map(nodeSchema => (
          <div key={nodeSchema.nodeType} className="node-schema-card">
            <div className="node-schema-header">
              <h3>{nodeSchema.nodeType} 노드</h3>
              <button
                className="add-property-button"
                onClick={() => handleAddProperty(nodeSchema.nodeType)}
              >
                + 프로퍼티 추가
              </button>
            </div>

            <div className="properties-list">
              <div className="property-header">
                <span>프로퍼티명</span>
                <span>타입</span>
                <span>필수</span>
                <span>설명</span>
                <span>작업</span>
              </div>

              {nodeSchema.properties.map((property, index) => (
                <div key={index} className="property-row">
                  <input
                    type="text"
                    value={property.name}
                    onChange={e =>
                      handleUpdateProperty(nodeSchema.nodeType, index, {
                        name: e.target.value,
                      })
                    }
                    placeholder="프로퍼티명"
                    className="property-input"
                  />
                  <select
                    value={property.type}
                    onChange={e =>
                      handleUpdateProperty(nodeSchema.nodeType, index, {
                        type: e.target.value as PropertyDefinition['type'],
                      })
                    }
                    className="property-select"
                  >
                    <option value="string">string</option>
                    <option value="number">number</option>
                    <option value="boolean">boolean</option>
                    <option value="date">date</option>
                    <option value="array">array</option>
                    <option value="object">object</option>
                  </select>
                  <input
                    type="checkbox"
                    checked={property.required}
                    onChange={e =>
                      handleUpdateProperty(nodeSchema.nodeType, index, {
                        required: e.target.checked,
                      })
                    }
                    className="property-checkbox"
                  />
                  <input
                    type="text"
                    value={property.description || ''}
                    onChange={e =>
                      handleUpdateProperty(nodeSchema.nodeType, index, {
                        description: e.target.value,
                      })
                    }
                    placeholder="설명 (선택)"
                    className="property-input"
                  />
                  <button
                    className="delete-button"
                    onClick={() =>
                      handleDeleteProperty(nodeSchema.nodeType, index)
                    }
                  >
                    삭제
                  </button>
                </div>
              ))}

              {nodeSchema.properties.length === 0 && (
                <div className="empty-properties">
                  프로퍼티가 없습니다. 추가 버튼을 클릭하세요.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

