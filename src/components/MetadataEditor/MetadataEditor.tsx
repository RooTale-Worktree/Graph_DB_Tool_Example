import { useState, useEffect } from 'react';
import { GraphMetadata } from '../../types/graph';
import { metadataApi } from '../../services/api';
import ImageUploader from './ImageUploader';
import './MetadataEditor.css';

export default function MetadataEditor() {
  const [allUniverseNodes, setAllUniverseNodes] = useState<GraphMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<GraphMetadata>>({});

  useEffect(() => {
    loadAllUniverseNodes();
  }, []);

  useEffect(() => {
    if (selectedNodeId) {
      const node = allUniverseNodes.find(n => n.id === selectedNodeId);
      if (node) {
        setFormData(node);
        setEditing(false);
      }
    }
  }, [selectedNodeId, allUniverseNodes]);

  const loadAllUniverseNodes = async () => {
    try {
      setLoading(true);
      const data = await metadataApi.getAllUniverseNodes();
      setAllUniverseNodes(data);
    } catch (error) {
      console.error('Failed to load universe nodes:', error);
      alert('유니버스 노드를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof GraphMetadata, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!selectedNodeId) return;

    try {
      await metadataApi.updateMetadata(selectedNodeId, formData);
      alert('메타데이터가 저장되었습니다.');
      setEditing(false);
      // 노드 목록 새로고침
      await loadAllUniverseNodes();
      // 현재 선택된 노드도 업데이트
      const updatedNode = allUniverseNodes.find(n => n.id === selectedNodeId);
      if (updatedNode) {
        setFormData(updatedNode);
      }
    } catch (error) {
      console.error('Failed to save metadata:', error);
      alert('메타데이터 저장에 실패했습니다.');
    }
  };

  const handleCancel = () => {
    const node = allUniverseNodes.find(n => n.id === selectedNodeId);
    if (node) {
      setFormData(node);
    }
    setEditing(false);
  };

  const handleBackToList = () => {
    setSelectedNodeId(null);
    setEditing(false);
    setFormData({});
  };

  const selectedNode = selectedNodeId ? allUniverseNodes.find(n => n.id === selectedNodeId) : null;

  // 상세 편집 페이지
  if (selectedNode) {
    return (
      <div className="metadata-editor">
        <div className="editor-header">
          <div className="header-with-back">
            <button className="back-button" onClick={handleBackToList}>
              ← 목록으로
            </button>
            <h2>{selectedNode.name || selectedNode.title || '유니버스 노드 편집'}</h2>
          </div>
          <p className="editor-description">
            쿼리 없이 간단하게 유니버스 노드의 메타데이터를 수정할 수 있습니다.
          </p>
        </div>

        <div className="metadata-form">
          <div className="form-header">
            <h3>메타데이터 정보</h3>
            {!editing && (
              <button
                className="edit-button"
                onClick={() => setEditing(true)}
              >
                편집
              </button>
            )}
            {editing && (
              <div className="form-actions">
                <button className="cancel-button" onClick={handleCancel}>
                  취소
                </button>
                <button className="save-button" onClick={handleSave}>
                  저장
                </button>
              </div>
            )}
          </div>

          <div className="form-fields">
            {/* 기본 정보 */}
            <div className="form-section">
              <h4 className="section-title">기본 정보</h4>
              <div className="form-field">
                <label>ID</label>
                <input
                  type="text"
                  value={selectedNode.id}
                  disabled
                  className="form-input disabled"
                />
              </div>

              <div className="form-field">
                <label>제목 (title) *</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  disabled={!editing}
                  className={`form-input ${!editing ? 'disabled' : ''}`}
                />
              </div>

              <div className="form-field">
                <label>이름 (name)</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={!editing}
                  className={`form-input ${!editing ? 'disabled' : ''}`}
                />
              </div>

              <div className="form-field">
                <label>유니버스 (universe)</label>
                <input
                  type="text"
                  value={formData.universe || ''}
                  onChange={(e) => handleInputChange('universe', e.target.value)}
                  disabled={!editing}
                  className={`form-input ${!editing ? 'disabled' : ''}`}
                />
              </div>

              <div className="form-field">
                <label>유니버스 ID (universe_id)</label>
                <input
                  type="text"
                  value={formData.universe_id || ''}
                  onChange={(e) => handleInputChange('universe_id', e.target.value)}
                  disabled={!editing}
                  className={`form-input ${!editing ? 'disabled' : ''}`}
                />
              </div>

              <div className="form-field">
                <label>플레이 시간 (play_time)</label>
                <input
                  type="text"
                  value={formData.play_time || ''}
                  onChange={(e) => handleInputChange('play_time', e.target.value)}
                  disabled={!editing}
                  className={`form-input ${!editing ? 'disabled' : ''}`}
                  placeholder="예: 40분"
                />
              </div>

              <div className="form-field">
                <ImageUploader
                  currentImageUrl={formData.representative_image}
                  onImageUploaded={(url) => handleInputChange('representative_image', url)}
                  disabled={!editing}
                  label="대표 이미지 (representative_image)"
                />
              </div>
            </div>

            {/* 설명 */}
            <div className="form-section">
              <h4 className="section-title">설명</h4>
              <div className="form-field">
                <label>설명 (description)</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  disabled={!editing}
                  className={`form-textarea ${!editing ? 'disabled' : ''}`}
                  rows={3}
                  placeholder="짧은 설명"
                />
              </div>

              <div className="form-field">
                <label>상세 설명 (detail_description)</label>
                <textarea
                  value={formData.detail_description || ''}
                  onChange={(e) => handleInputChange('detail_description', e.target.value)}
                  disabled={!editing}
                  className={`form-textarea ${!editing ? 'disabled' : ''}`}
                  rows={6}
                  placeholder="상세한 설명"
                />
              </div>
            </div>

            {/* 주인공 정보 */}
            <div className="form-section">
              <h4 className="section-title">주인공 정보</h4>
              <div className="form-field">
                <label>주인공 이름 (protagonist_name)</label>
                <input
                  type="text"
                  value={formData.protagonist_name || ''}
                  onChange={(e) => handleInputChange('protagonist_name', e.target.value)}
                  disabled={!editing}
                  className={`form-input ${!editing ? 'disabled' : ''}`}
                />
              </div>

              <div className="form-field">
                <label>주인공 설명 (protagonist_desc)</label>
                <textarea
                  value={formData.protagonist_desc || ''}
                  onChange={(e) => handleInputChange('protagonist_desc', e.target.value)}
                  disabled={!editing}
                  className={`form-textarea ${!editing ? 'disabled' : ''}`}
                  rows={5}
                  placeholder="주인공에 대한 상세한 설명"
                />
              </div>
            </div>

            {/* 스토리 */}
            <div className="form-section">
              <h4 className="section-title">스토리</h4>
              <div className="form-field">
                <label>설정 (setting)</label>
                <textarea
                  value={formData.setting || ''}
                  onChange={(e) => handleInputChange('setting', e.target.value)}
                  disabled={!editing}
                  className={`form-textarea ${!editing ? 'disabled' : ''}`}
                  rows={8}
                  placeholder="세계관 및 설정 설명"
                />
              </div>

              <div className="form-field">
                <label>시놉시스 (synopsis)</label>
                <textarea
                  value={formData.synopsis || ''}
                  onChange={(e) => handleInputChange('synopsis', e.target.value)}
                  disabled={!editing}
                  className={`form-textarea ${!editing ? 'disabled' : ''}`}
                  rows={10}
                  placeholder="전체 스토리 시놉시스"
                />
              </div>

              <div className="form-field">
                <label>변주된 시놉시스 (twisted_synopsis)</label>
                <textarea
                  value={formData.twisted_synopsis || ''}
                  onChange={(e) => handleInputChange('twisted_synopsis', e.target.value)}
                  disabled={!editing}
                  className={`form-textarea ${!editing ? 'disabled' : ''}`}
                  rows={10}
                  placeholder="변주된 버전의 시놉시스"
                />
              </div>
            </div>

            {/* 시스템 정보 */}
            <div className="form-section">
              <h4 className="section-title">시스템 정보</h4>
              {selectedNode.created_at && (
                <div className="form-field">
                  <label>생성일 (created_at)</label>
                  <input
                    type="text"
                    value={new Date(selectedNode.created_at).toLocaleString()}
                    disabled
                    className="form-input disabled"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 리스트 뷰
  return (
    <div className="metadata-editor">
      <div className="editor-header">
        <h2>유니버스 노드 메타데이터 편집</h2>
        <p className="editor-description">
          쿼리 없이 간단하게 유니버스 노드의 메타데이터를 수정할 수 있습니다.
          <br />
          노드를 클릭하여 상세 편집 페이지로 이동할 수 있습니다.
        </p>
      </div>

      {loading && <div className="loading">로딩 중...</div>}

      {!loading && allUniverseNodes.length > 0 && (
        <div className="universe-nodes-grid">
          {allUniverseNodes.map(node => (
            <div
              key={node.id}
              className="universe-node-card"
              onClick={() => setSelectedNodeId(node.id)}
            >
              {node.representative_image ? (
                <img
                  src={node.representative_image}
                  alt={node.name || node.title}
                  className="node-thumbnail"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="node-thumbnail-placeholder">
                  <span>이미지 없음</span>
                </div>
              )}
              <div className="node-card-content">
                <h3 className="node-name">{node.name || node.title || '제목 없음'}</h3>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && allUniverseNodes.length === 0 && (
        <div className="empty-metadata">
          유니버스 노드가 없습니다.
        </div>
      )}
    </div>
  );
}
