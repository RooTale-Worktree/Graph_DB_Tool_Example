import { useState } from 'react';
import './Login.css';

interface LoginProps {
  onLogin: () => void;
  onSkip: () => void;
}

export default function Login({ onLogin, onSkip }: LoginProps) {
  const [email, setEmail] = useState('rootale@gmail.com');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - 실제로는 API 호출
    console.log('Login attempt:', { email, password });
    onLogin();
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Graph DB Tool</h1>
          <p>그래프 데이터베이스 관리 시스템</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rootale@gmail.com"
              className="login-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              className="login-input"
            />
          </div>

          <button type="submit" className="login-button">
            로그인
          </button>
        </form>

        <div className="login-footer">
          <button type="button" onClick={onSkip} className="skip-button">
            스킵하고 계속하기
          </button>
        </div>
      </div>
    </div>
  );
}

