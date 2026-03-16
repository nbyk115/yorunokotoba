// ============================================
// アップデート通知システム（JSX不要版）
// ============================================

// 現在のバージョン情報
var APP_VERSION = {
  version: '1.0',
  releaseDate: '2026-02-22',
  features: [
    '新キャラクター12体追加（全24体に）',
    '日替わり運勢機能を追加',
    'bestMatch詳細表示機能',
    'プレミアムプラン開始（相性診断）'
  ]
};

// バージョン履歴
var VERSION_HISTORY = [
  {
    version: '1.0',
    date: '2026-02-22',
    title: '大型アップデート🎉',
    description: '新キャラ12体追加＆プレミアム機能リリース！',
    isNew: true
  }
];

// アップデート通知の表示判定
function shouldShowUpdateNotification() {
  // 常に表示（テスト用）
  return true;
}

// バージョン情報を記録
function markVersionAsSeen() {
  localStorage.setItem('lastSeenVersion', APP_VERSION.version);
  localStorage.setItem('lastSeenDate', new Date().toISOString());
}

// UpdateNotificationModal（vanilla JS版）
function UpdateNotificationModal(props) {
  var onClose = props.onClose;
  
  var handleClose = function() {
    markVersionAsSeen();
    onClose();
  };

  // ダークモード判定
  var isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  // モーダルHTML文字列を生成
  var modalHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      padding: 20px;
      animation: fadeIn 0.3s ease-out;
    " onclick="window.closeUpdateModal()">
      <div style="
        background-color: ${isDark ? '#241828' : 'white'};
        border-radius: 25px;
        max-width: 500px;
        width: 100%;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        animation: slideUp 0.4s ease-out;
      " onclick="event.stopPropagation()">

        <!-- ヘッダー -->
        <div style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px 30px;
          text-align: center;
          position: relative;
        ">
          <div style="position: relative; z-index: 1;">
            <div style="font-size: 64px; margin-bottom: 15px; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.3));">
              🎉✨
            </div>

            <div style="
              color: white;
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 0;
              text-shadow: 0 2px 10px rgba(0,0,0,0.3);
            ">
              新機能が追加されました
            </div>
          </div>
        </div>

        <!-- 新機能リスト -->
        <div style="padding: 30px; max-height: 400px; overflow-y: auto;">
          <h3 style="
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 20px;
            color: ${isDark ? '#e0d0e8' : '#333'};
            display: flex;
            align-items: center;
            gap: 10px;
          ">
            <span style="font-size: 28px;">🎁</span>
            新機能
          </h3>

          ${APP_VERSION.features.map((feature, index) => `
            <div style="
              display: flex;
              align-items: flex-start;
              margin-bottom: 18px;
              padding: 15px;
              background-color: ${isDark ? (index % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)') : (index % 2 === 0 ? '#f8f9fa' : '#fff')};
              border-radius: 12px;
              border: 2px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e9ecef'};
            ">
              <span style="font-size: 24px; margin-right: 12px; flex-shrink: 0;">
                ${index === 0 ? '🐾' : index === 1 ? '⭐' : index === 2 ? '💕' : '✨'}
              </span>
              <div style="font-size: 15px; line-height: 1.6; color: ${isDark ? '#d0c0d8' : '#333'}; font-weight: 500;">
                ${feature}
              </div>
            </div>
          `).join('')}

          <!-- プレミアム特別アピール -->
          <div style="
            margin-top: 25px;
            padding: 20px;
            background: ${isDark ? 'linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,105,180,0.1) 100%)' : 'linear-gradient(135deg, #fff5e6 0%, #ffe6f0 100%)'};
            border-radius: 15px;
            border: 2px solid ${isDark ? 'rgba(255,215,0,0.3)' : '#ffd700'};
            text-align: center;
          ">
            <div style="font-size: 32px; margin-bottom: 10px;">💎</div>
            <div style="font-size: 16px; font-weight: bold; color: ${isDark ? '#f0d060' : '#d4af37'}; margin-bottom: 8px;">
              プレミアムプラン登場
            </div>
            <div style="font-size: 13px; color: ${isDark ? '#b8a8c0' : '#666'}; line-height: 1.6;">
              二人の相性診断が無制限！<br/>
              初回7日間無料でお試しいただけます
            </div>
          </div>
        </div>

        <!-- ボタン -->
        <div style="padding: 20px 30px 30px;">
          <button onclick="window.closeUpdateModal()" style="
            width: 100%;
            padding: 16px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          ">
            さっそく使ってみる！
          </button>
        </div>
      </div>
    </div>

    <style>
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
    </style>
  `;

  return modalHTML;
}

// モーダルを表示する関数
function showUpdateNotificationModal() {
  var modalContainer = document.createElement('div');
  modalContainer.id = 'update-modal-container';
  modalContainer.innerHTML = UpdateNotificationModal({
    onClose: function() {
      closeUpdateModal();
    }
  });
  document.body.appendChild(modalContainer);
  
  // グローバル関数として登録
  window.closeUpdateModal = function() {
    markVersionAsSeen();
    var container = document.getElementById('update-modal-container');
    if (container) {
      container.remove();
    }
  };
}

// バージョンバッジ
function VersionBadge(onClick) {
  var badge = document.createElement('div');
  badge.id = 'version-badge';
  badge.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: rgba(102, 126, 234, 0.9);
      color: white;
      padding: 8px 15px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      backdrop-filter: blur(10px);
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 6px;
    ">
      <span>v${APP_VERSION.version}</span>
      <span style="
        background-color: #ff4757;
        padding: 2px 8px;
        border-radius: 10px;
        font-size: 10px;
        animation: pulse 2s ease-in-out infinite;
      ">
        NEW
      </span>
    </div>
    
    <style>
      @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(0.95); }
      }
      
      #version-badge:hover > div {
        transform: scale(1.05);
        background-color: rgba(118, 75, 162, 0.9);
      }
    </style>
  `;
  
  badge.addEventListener('click', onClick);
  return badge;
}

// 初期化
document.addEventListener('DOMContentLoaded', function() {
  // アップデート通知チェック
  if (shouldShowUpdateNotification()) {
    setTimeout(function() {
      showUpdateNotificationModal();
    }, 500);
  }
  
  // バージョンバッジは非表示（ユーザーに不要）
  // var versionBadge = VersionBadge(function() {
  //   showUpdateNotificationModal();
  // });
  // document.body.appendChild(versionBadge);
});

console.log('✅ アップデート通知システム読み込み完了');
console.log('現在のバージョン: v' + APP_VERSION.version);
