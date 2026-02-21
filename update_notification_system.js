// ============================================
// アップデート通知システム
// ============================================

// 現在のバージョン情報
const APP_VERSION = {
  version: '8.0.0',
  releaseDate: '2026-02-22',
  features: [
    '新キャラクター12体追加（全24体に）',
    '日替わり運勢機能を追加',
    'bestMatch詳細表示機能',
    'プレミアムプラン開始（相性診断）'
  ]
};

// バージョン履歴（過去のアップデート）
const VERSION_HISTORY = [
  {
    version: '8.0.0',
    date: '2026-02-22',
    title: '大型アップデート🎉',
    description: '新キャラ12体追加＆プレミアム機能リリース！',
    isNew: true
  },
  {
    version: '7.0.0',
    date: '2025-XX-XX',
    title: '初回リリース',
    description: 'よるのことばv7公開',
    isNew: false
  }
];

// ============================================
// アップデート通知の表示判定
// ============================================
const shouldShowUpdateNotification = () => {
  // LocalStorageから前回見たバージョンを取得
  const lastSeenVersion = localStorage.getItem('lastSeenVersion');
  
  // 初回訪問 or バージョンが異なる場合は通知を表示
  if (!lastSeenVersion || lastSeenVersion !== APP_VERSION.version) {
    return true;
  }
  
  return false;
};

// ============================================
// バージョン情報を記録
// ============================================
const markVersionAsSeen = () => {
  localStorage.setItem('lastSeenVersion', APP_VERSION.version);
  localStorage.setItem('lastSeenDate', new Date().toISOString());
};

// ============================================
// アップデート通知モーダル（React Component）
// ============================================
const UpdateNotificationModal = ({ onClose }) => {
  const handleClose = () => {
    markVersionAsSeen();
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '20px',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '25px',
        maxWidth: '500px',
        width: '100%',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        animation: 'slideUp 0.4s ease-out'
      }}>
        {/* ヘッダー */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '40px 30px',
          textAlign: 'center',
          position: 'relative'
        }}>
          {/* キラキラエフェクト */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 80 80\'%3E%3Cpath fill=\'%23ffffff\' fill-opacity=\'0.15\' d=\'M14 16H9v-2h5V9h2v5h5v2h-5v5h-2v-5zM25 63h-2v-5h-5v-2h5v-5h2v5h5v2h-5v5zm23-22h-2v-5h-5v-2h5v-5h2v5h5v2h-5v5z\'/%3E%3C/svg%3E")',
            animation: 'sparkle 20s linear infinite'
          }}></div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              fontSize: '64px',
              marginBottom: '15px',
              filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))'
            }}>
              🎉✨
            </div>
            
            <div style={{
              color: 'white',
              fontSize: '28px',
              fontWeight: 'bold',
              marginBottom: '10px',
              textShadow: '0 2px 10px rgba(0,0,0,0.3)'
            }}>
              アップデート完了！
            </div>
            
            <div style={{
              color: 'rgba(255,255,255,0.95)',
              fontSize: '16px',
              fontWeight: 'bold',
              backgroundColor: 'rgba(255,255,255,0.2)',
              display: 'inline-block',
              padding: '8px 20px',
              borderRadius: '20px',
              backdropFilter: 'blur(10px)'
            }}>
              v{APP_VERSION.version}
            </div>
          </div>
        </div>

        {/* 新機能リスト */}
        <div style={{
          padding: '30px',
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            marginBottom: '20px',
            color: '#333',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '28px' }}>🎁</span>
            新機能
          </h3>

          {APP_VERSION.features.map((feature, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: '18px',
              padding: '15px',
              backgroundColor: index % 2 === 0 ? '#f8f9fa' : '#fff',
              borderRadius: '12px',
              border: '2px solid #e9ecef',
              transition: 'all 0.2s',
              cursor: 'default'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#667eea10';
              e.currentTarget.style.borderColor = '#667eea';
              e.currentTarget.style.transform = 'translateX(5px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#f8f9fa' : '#fff';
              e.currentTarget.style.borderColor = '#e9ecef';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
            >
              <span style={{
                fontSize: '24px',
                marginRight: '12px',
                flexShrink: 0
              }}>
                {index === 0 ? '🐾' : index === 1 ? '⭐' : index === 2 ? '💕' : '✨'}
              </span>
              <div style={{
                fontSize: '15px',
                lineHeight: '1.6',
                color: '#333',
                fontWeight: '500'
              }}>
                {feature}
              </div>
            </div>
          ))}

          {/* プレミアム機能の特別アピール */}
          <div style={{
            marginTop: '25px',
            padding: '20px',
            background: 'linear-gradient(135deg, #fff5e6 0%, #ffe6f0 100%)',
            borderRadius: '15px',
            border: '2px solid #ffd700',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>💎</div>
            <div style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#d4af37',
              marginBottom: '8px'
            }}>
              プレミアムプラン登場
            </div>
            <div style={{
              fontSize: '13px',
              color: '#666',
              lineHeight: '1.6'
            }}>
              二人の相性診断が無制限！<br/>
              初回7日間無料でお試しいただけます
            </div>
          </div>
        </div>

        {/* ボタン */}
        <div style={{
          padding: '20px 30px 30px',
          display: 'flex',
          gap: '10px'
        }}>
          <button
            onClick={handleClose}
            style={{
              flex: 1,
              padding: '16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
            }}
          >
            さっそく使ってみる！
          </button>
        </div>
      </div>

      {/* アニメーション */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes sparkle {
          from { transform: translateY(0); }
          to { transform: translateY(-80px); }
        }
      `}</style>
    </div>
  );
};

// ============================================
// バージョンバッジ（フッターに表示）
// ============================================
const VersionBadge = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: 'rgba(102, 126, 234, 0.9)',
        color: 'white',
        padding: '8px 15px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.2s',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.backgroundColor = 'rgba(118, 75, 162, 0.9)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.backgroundColor = 'rgba(102, 126, 234, 0.9)';
      }}
    >
      <span>v{APP_VERSION.version}</span>
      {VERSION_HISTORY[0].isNew && (
        <span style={{
          backgroundColor: '#ff4757',
          padding: '2px 8px',
          borderRadius: '10px',
          fontSize: '10px',
          animation: 'pulse 2s ease-in-out infinite'
        }}>
          NEW
        </span>
      )}
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.95); }
        }
      `}</style>
    </div>
  );
};

// ============================================
// 使い方（メインコンポーネントで）
// ============================================
/*
// Stateを追加
const [showUpdateModal, setShowUpdateModal] = React.useState(false);

// コンポーネントマウント時にチェック
React.useEffect(() => {
  if (shouldShowUpdateNotification()) {
    setShowUpdateModal(true);
  }
}, []);

// JSX内に追加
{showUpdateModal && (
  <UpdateNotificationModal 
    onClose={() => setShowUpdateModal(false)} 
  />
)}

<VersionBadge onClick={() => setShowUpdateModal(true)} />
*/

console.log('アップデート通知システム読み込み完了');
console.log(`現在のバージョン: v${APP_VERSION.version}`);
