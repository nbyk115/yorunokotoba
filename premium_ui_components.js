// ============================================
// よるのことば v8.0.0 プレミアム機能 UI完全版
// ============================================

// このコードをReactコンポーネント内に追加してください

// ============================================
// 1. bestMatchモーダル（詳細表示）
// ============================================
function CharacterDetailModal({ character, onClose }) {
  if (!character) return null;

  return React.createElement('div', {
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px',
      overflowY: 'auto'
    },
    onClick: onClose
  },
    React.createElement('div', {
      style: {
        backgroundColor: 'white',
        borderRadius: '20px',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        padding: '30px 20px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
      },
      onClick: (e) => e.stopPropagation()
    },
      // 閉じるボタン
      React.createElement('button', {
        onClick: onClose,
        style: {
          position: 'absolute',
          top: '15px',
          right: '15px',
          background: 'none',
          border: 'none',
          fontSize: '28px',
          cursor: 'pointer',
          color: '#999',
          padding: '5px 10px',
          lineHeight: 1
        }
      }, '×'),
      
      // キャラクター画像
      React.createElement('div', { style: { textAlign: 'center', marginBottom: '20px' }},
        React.createElement('img', {
          src: CHARA_IMAGES[character.id],
          alt: character.name,
          style: {
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            border: '4px solid #FFD700',
            marginBottom: '15px'
          }
        }),
        React.createElement('h2', {
          style: {
            fontSize: '24px',
            margin: '0 0 8px 0',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold'
          }
        }, character.name),
        React.createElement('p', {
          style: {
            fontSize: '14px',
            color: '#666',
            margin: 0
          }
        }, character.sub)
      ),
      
      // 性格・特徴
      React.createElement('div', { style: { marginBottom: '20px' }},
        React.createElement('h3', {
          style: {
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }
        },
          React.createElement('span', { style: { fontSize: '20px' }}, '✨'),
          '性格・特徴'
        ),
        React.createElement('p', {
          style: {
            fontSize: '14px',
            lineHeight: '1.7',
            color: '#333',
            margin: 0,
            padding: '12px',
            backgroundColor: '#f8f9fa',
            borderRadius: '10px'
          }
        }, character.desc)
      ),
      
      // 恋愛傾向
      React.createElement('div', { style: { marginBottom: '20px' }},
        React.createElement('h3', {
          style: {
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }
        },
          React.createElement('span', { style: { fontSize: '20px' }}, '💕'),
          '恋愛傾向'
        ),
        React.createElement('p', {
          style: {
            fontSize: '14px',
            lineHeight: '1.7',
            color: '#333',
            margin: 0,
            padding: '12px',
            backgroundColor: '#fff0f5',
            borderRadius: '10px'
          }
        }, character.love)
      ),
      
      // 仕事の特徴
      React.createElement('div', { style: { marginBottom: '20px' }},
        React.createElement('h3', {
          style: {
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }
        },
          React.createElement('span', { style: { fontSize: '20px' }}, '💼'),
          '仕事の特徴'
        ),
        React.createElement('p', {
          style: {
            fontSize: '14px',
            lineHeight: '1.7',
            color: '#333',
            margin: 0,
            padding: '12px',
            backgroundColor: '#f0f8ff',
            borderRadius: '10px'
          }
        }, character.work)
      ),
      
      // 弱点
      React.createElement('div', { style: { marginBottom: '20px' }},
        React.createElement('h3', {
          style: {
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }
        },
          React.createElement('span', { style: { fontSize: '20px' }}, '😅'),
          '弱点'
        ),
        React.createElement('p', {
          style: {
            fontSize: '14px',
            lineHeight: '1.7',
            color: '#333',
            margin: 0,
            padding: '12px',
            backgroundColor: '#fffacd',
            borderRadius: '10px'
          }
        }, character.weak)
      ),
      
      // 閉じるボタン（下部）
      React.createElement('button', {
        onClick: onClose,
        style: {
          width: '100%',
          padding: '15px',
          backgroundColor: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          marginTop: '10px'
        }
      }, '閉じる')
    )
  );
}

// ============================================
// 2. プレミアムモーダル
// ============================================
function PremiumModal({ onClose, onSubscribe }) {
  return React.createElement('div', {
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px'
    },
    onClick: onClose
  },
    React.createElement('div', {
      style: {
        backgroundColor: 'white',
        borderRadius: '20px',
        maxWidth: '450px',
        width: '100%',
        padding: '0',
        overflow: 'hidden'
      },
      onClick: (e) => e.stopPropagation()
    },
      // ヘッダー
      React.createElement('div', {
        style: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '30px 20px',
          textAlign: 'center',
          position: 'relative'
        }
      },
        React.createElement('button', {
          onClick: onClose,
          style: {
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'rgba(255,255,255,0.3)',
            border: 'none',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            fontSize: '20px',
            cursor: 'pointer',
            color: 'white'
          }
        }, '×'),
        React.createElement('div', { style: { fontSize: '48px', marginBottom: '10px' }}, '✨'),
        React.createElement('h2', {
          style: {
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold',
            margin: 0
          }
        }, 'プレミアムプラン')
      ),
      
      // 機能一覧
      React.createElement('div', { style: { padding: '30px 25px' }},
        // 二人の相性診断
        React.createElement('div', {
          style: {
            display: 'flex',
            alignItems: 'flex-start',
            marginBottom: '15px'
          }
        },
          React.createElement('span', { style: { fontSize: '24px', marginRight: '12px' }}, '💕'),
          React.createElement('div', {},
            React.createElement('h4', {
              style: { margin: '0 0 5px 0', fontSize: '16px', fontWeight: 'bold' }
            }, '二人の相性診断（無制限）'),
            React.createElement('p', {
              style: { margin: 0, fontSize: '13px', color: '#666', lineHeight: '1.5' }
            }, '気になる人との相性を詳しく診断。恋愛・友情・仕事、全ての相性が分かります')
          )
        ),
        
        // 価格
        React.createElement('div', {
          style: {
            backgroundColor: '#f8f9fa',
            borderRadius: '10px',
            padding: '20px',
            textAlign: 'center',
            marginTop: '25px',
            marginBottom: '20px'
          }
        },
          React.createElement('p', {
            style: { fontSize: '13px', color: '#666', margin: '0 0 10px 0' }
          }, '初回7日間無料トライアル'),
          React.createElement('div', {
            style: {
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#667eea',
              margin: '0 0 5px 0'
            }
          },
            '¥480',
            React.createElement('span', { style: { fontSize: '16px', color: '#999' }}, '/月')
          ),
          React.createElement('p', {
            style: { fontSize: '12px', color: '#999', margin: 0 }
          }, 'いつでもキャンセル可能')
        ),
        
        // 登録ボタン
        React.createElement('button', {
          onClick: onSubscribe,
          style: {
            width: '100%',
            padding: '18px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginBottom: '15px',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
          }
        }, '7日間無料で試してみる'),
        
        React.createElement('p', {
          style: {
            fontSize: '11px',
            color: '#999',
            textAlign: 'center',
            lineHeight: '1.5',
            margin: 0
          }
        }, 'トライアル期間中にキャンセルすれば料金は発生しません')
      )
    )
  );
}

console.log('✅ プレミアム機能UIコンポーネントを読み込みました');
