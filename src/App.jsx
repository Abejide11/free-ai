import React, { useState, useEffect } from 'react';

const MAX_TRIALS = 50;

const App = () => {
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trials, setTrials] = useState(() => {
    const saved = localStorage.getItem('chat_trials');
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    localStorage.setItem('chat_trials', trials);
  }, [trials]);

  const callOpenRouter = async () => {
    if (!userInput.trim() || trials >= MAX_TRIALS) return;

    const newMessages = [...messages, { role: 'user', content: userInput }];
    setMessages(newMessages);
    setLoading(true);
    setTrials(prev => prev + 1);

    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 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',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.3-8b-instruct:free',
          messages: newMessages,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status} - ${errorText}`);
      }

      const data = await res.json();
      const botMessage = data.choices?.[0]?.message?.content || 'No response';
      setMessages([...newMessages, { role: 'assistant', content: botMessage }]);
      setUserInput('');
    } catch (err) {
      console.error('Error calling OpenRouter:', err);
      setMessages([...newMessages, {
        role: 'assistant',
        content: `Error: ${err.message || 'Failed to fetch response'}`
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !loading && trials < MAX_TRIALS) {
      callOpenRouter();
    }
  };

  const isLimitReached = trials >= MAX_TRIALS;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>AI Chat</h1>

      <div style={styles.messages}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ ...styles.messageRow, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{ 
              ...styles.bubble,
              backgroundColor: msg.role === 'user' ? '#dbeafe' : '#bbf7d0',
              textAlign: msg.role === 'user' ? 'right' : 'left'
            }}>
              <strong>{msg.role === 'user' ? 'You' : 'AI'}:</strong> {msg.content}
            </div>
          </div>
        ))}
      </div>

      <input
        type="text"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        onKeyDown={handleKeyDown}
        style={styles.input}
        placeholder={isLimitReached ? 'Trial limit reached' : 'Type your message...'}
        disabled={loading || isLimitReached}
        autoFocus
      />

      <button
        onClick={callOpenRouter}
        style={{
          ...styles.button,
          backgroundColor: loading || isLimitReached ? '#93c5fd' : '#2563eb',
          cursor: loading || isLimitReached ? 'not-allowed' : 'pointer',
        }}
        disabled={loading || isLimitReached}
      >
        {loading ? 'Loading...' : 'Send'}
      </button>

      {isLimitReached && (
        <div style={styles.warning}>
          Trial limit of 50 messages reached. Refresh or upgrade to continue.
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '16px',
    maxWidth: '600px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  messages: {
    marginTop: '1rem',
    maxHeight: '400px',
    overflowY: 'auto',
    paddingRight: '8px',
    marginBottom: '8px',
  },
  messageRow: {
    display: 'flex',
    marginBottom: '8px',
  },
  bubble: {
    padding: '8px',
    borderRadius: '8px',
    maxWidth: '70%',
    whiteSpace: 'pre-wrap',
  },
  input: {
    width: '100%',
    padding: '8px',
    marginBottom: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  button: {
    width: '100%',
    padding: '10px',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
  },
  warning: {
    color: 'red',
    fontSize: '0.875rem',
    marginTop: '4px',
    textAlign: 'center',
  },
};

export default App;
