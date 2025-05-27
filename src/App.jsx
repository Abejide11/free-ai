import React, { useState } from 'react';

const App = () => {
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const callOpenRouter = async () => {
    if (!userInput.trim()) return;

    const newMessages = [...messages, { role: 'user', content: userInput }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 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',
        },
        body: JSON.stringify({
          model: 'opengvlab/internvl3-14b:free',
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
    if (e.key === 'Enter' && !loading) {
      callOpenRouter();
    }
  };

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
        placeholder="Type your message..."
        disabled={loading}
        autoFocus
      />

      <button
        onClick={callOpenRouter}
        style={{
          ...styles.button,
          backgroundColor: loading ? '#93c5fd' : '#2563eb',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Send'}
      </button>
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
};

export default App;
