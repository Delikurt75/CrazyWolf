import { Component, ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };
  static getDerivedStateFromError(error: Error): State { return { error }; }
  componentDidCatch(error: Error, info: any) {
    console.error('App error:', error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ position: 'fixed', inset: 0, background: '#1a0030', color: '#fff', padding: 20, fontFamily: 'monospace', overflow: 'auto' }}>
          <h2 style={{ color: '#ff5252' }}>Oyun başlatılırken hata oldu</h2>
          <pre style={{ marginTop: 12, whiteSpace: 'pre-wrap', fontSize: 11 }}>{String(this.state.error.stack || this.state.error.message)}</pre>
          <button
            onClick={() => location.reload()}
            style={{ marginTop: 20, padding: '12px 24px', background: '#3a8fff', border: 'none', color: 'white', borderRadius: 8, fontSize: 14 }}
          >Yeniden Yükle</button>
        </div>
      );
    }
    return this.props.children;
  }
}
