import { useState, useEffect } from 'react';
import { imageApi } from '../../services/api';
import './ImageUploader.css';

interface ImageUploaderProps {
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
  disabled?: boolean;
  label?: string;
}

export default function ImageUploader({
  currentImageUrl,
  onImageUploaded,
  disabled = false,
  label = '대표 이미지',
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [dragActive, setDragActive] = useState(false);
  const [inputMode, setInputMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState<string>(currentImageUrl || '');

  useEffect(() => {
    if (currentImageUrl) {
      setPreviewUrl(currentImageUrl);
      setUrlInput(currentImageUrl);
    } else {
      setPreviewUrl(null);
      setUrlInput('');
    }
  }, [currentImageUrl]);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('파일 크기는 10MB 이하여야 합니다.');
      return;
    }

    try {
      setUploading(true);
      
      // 미리보기 표시
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // S3 업로드
      const imageUrl = await imageApi.uploadImage(file);
      onImageUploaded(imageUrl);
      setPreviewUrl(imageUrl);
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('이미지 업로드에 실패했습니다.');
      setPreviewUrl(currentImageUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    setUrlInput('');
    onImageUploaded('');
  };

  const handleUrlChange = (url: string) => {
    setUrlInput(url);
    if (url.trim()) {
      setPreviewUrl(url);
      onImageUploaded(url);
    } else {
      setPreviewUrl(null);
      onImageUploaded('');
    }
  };

  const handleUrlBlur = () => {
    if (urlInput.trim()) {
      setPreviewUrl(urlInput.trim());
      onImageUploaded(urlInput.trim());
    }
  };

  return (
    <div className="image-uploader">
      <div className="image-uploader-header">
        <label className="image-uploader-label">{label}</label>
        {!disabled && (
          <div className="mode-toggle">
            <button
              type="button"
              className={`mode-button ${inputMode === 'upload' ? 'active' : ''}`}
              onClick={() => setInputMode('upload')}
            >
              업로드
            </button>
            <button
              type="button"
              className={`mode-button ${inputMode === 'url' ? 'active' : ''}`}
              onClick={() => setInputMode('url')}
            >
              URL 입력
            </button>
          </div>
        )}
      </div>

      {inputMode === 'url' ? (
        <div className="url-input-section">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => handleUrlChange(e.target.value)}
            onBlur={handleUrlBlur}
            disabled={disabled}
            className="image-url-input-editable"
            placeholder="https://example.com/image.png"
          />
          {previewUrl && (
            <div className="image-preview-container">
              <img src={previewUrl} alt="Preview" className="image-preview" onError={() => setPreviewUrl(null)} />
              {!disabled && (
                <div className="image-preview-overlay">
                  <button
                    className="remove-image-button"
                    onClick={handleRemoveImage}
                    type="button"
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          <div
            className={`image-upload-area ${dragActive ? 'drag-active' : ''} ${disabled ? 'disabled' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {previewUrl ? (
              <div className="image-preview-container">
                <img src={previewUrl} alt="Preview" className="image-preview" />
                {!disabled && (
                  <div className="image-preview-overlay">
                    <button
                      className="remove-image-button"
                      onClick={handleRemoveImage}
                      type="button"
                    >
                      삭제
                    </button>
                    <label className="change-image-button">
                      변경
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileInputChange}
                        disabled={disabled || uploading}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                )}
              </div>
            ) : (
              <div className="image-upload-placeholder">
                {uploading ? (
                  <div className="uploading-indicator">
                    <div className="spinner"></div>
                    <span>업로드 중...</span>
                  </div>
                ) : (
                  <>
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    <p>이미지를 드래그하거나 클릭하여 업로드</p>
                    <p className="upload-hint">PNG, JPG, GIF 최대 10MB</p>
                    {!disabled && (
                      <label className="upload-button">
                        파일 선택
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileInputChange}
                          disabled={disabled || uploading}
                          style={{ display: 'none' }}
                        />
                      </label>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          {previewUrl && (
            <input
              type="text"
              value={previewUrl}
              readOnly
              className="image-url-input"
              placeholder="이미지 URL이 자동으로 입력됩니다"
            />
          )}
        </>
      )}
    </div>
  );
}

