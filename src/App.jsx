import React, { useState } from 'react';

const MAX_TRIALS = 50;

const OpenRouterChat = () => {
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trials, setTrials] = useState(0);

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
    <div className="chat-container">
      <h1 className="chat-title">AI Chat</h1>

      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message-row ${msg.role}`}>
            <div className={`message-bubble ${msg.role}`}>
              <strong>{msg.role === 'user' ? 'You' : 'AI assisant'}:</strong> {msg.content}
            </div>
          </div>
        ))}
      </div>

      <input
        type="text"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        onKeyDown={handleKeyDown}
        className="chat-input"
        placeholder={isLimitReached ? 'Trial limit reached' : 'Type your message...'}
        disabled={loading || isLimitReached}
        autoFocus
      />

      <button
        onClick={callOpenRouter}
        className="chat-button"
        disabled={loading || isLimitReached}
      >
        {loading ? 'Loading...' : 'Send'}
      </button>

      {isLimitReached && (
        <div className="chat-limit-warning">
          Trial limit of 50 messages reached. Upgrade or restart to continue.
        </div>
      )}
    </div>
  );
};

export default OpenRouterChat;
