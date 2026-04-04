// Frontend/personal-assistance-app/src/Component/Chatbot/Chatbot.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  IconButton, 
  Fab, 
  Badge, 
  Avatar, 
  Chip, 
  List, 
  ListItem, 
  ListItemText, 
  Collapse, 
  Divider,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import MinimizeIcon from '@mui/icons-material/Remove';
import ChatIcon from '@mui/icons-material/Chat';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';

// Styled components
const ChatContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: 20,
  right: 20,
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end'
}));

const ChatWindow = styled(Paper)(({ theme }) => ({
  width: 350,
  maxWidth: '90vw',
  maxHeight: '70vh',
  display: 'flex',
  flexDirection: 'column',
  marginBottom: 16,
  overflow: 'hidden',
  borderRadius: 12,
  boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
}));

const ChatHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1.5, 2),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText
}));

const ChatMessages = styled(List)(({ theme }) => ({
  flexGrow: 1,
  overflow: 'auto',
  padding: theme.spacing(2),
  maxHeight: 300
}));

const MessageBubble = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isUser',
})(({ theme, isUser }) => ({
  backgroundColor: isUser ? theme.palette.primary.light : theme.palette.grey[100],
  color: isUser ? theme.palette.primary.contrastText : theme.palette.text.primary,
  borderRadius: 16,
  padding: theme.spacing(1.5, 2),
  maxWidth: '80%',
  wordBreak: 'break-word',
  marginBottom: 8,
  position: 'relative'
}));

const ChatFooter = styled(Box)(({ theme }) => ({
  borderTop: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(1),
  backgroundColor: theme.palette.background.paper
}));

const TypingIndicator = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1.5, 2),
  '& > span': {
    height: 8,
    width: 8,
    borderRadius: '50%',
    backgroundColor: theme.palette.grey[400],
    marginRight: 4,
    opacity: 0.5,
    animation: 'typing-animation 1.4s infinite both',
    '&:nth-of-type(2)': {
      animationDelay: '0.2s'
    },
    '&:nth-of-type(3)': {
      animationDelay: '0.4s'
    }
  },
  '@keyframes typing-animation': {
    '0%': { opacity: 0.5, transform: 'translateY(0)' },
    '50%': { opacity: 1, transform: 'translateY(-4px)' },
    '100%': { opacity: 0.5, transform: 'translateY(0)' }
  }
}));

const StatusIndicator = styled('span')(({ theme }) => ({
  width: 8,
  height: 8,
  backgroundColor: '#4caf50',
  borderRadius: '50%',
  position: 'absolute',
  bottom: 2,
  right: 2,
  border: `1px solid ${theme.palette.background.paper}`
}));

const SuggestionsContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const ChatInputForm = styled('form')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
}));

const playNotificationTone = (canPlayAudio = false) => {
  try {
    if (!canPlayAudio) {
      return;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      return;
    }

    const audioContext = new AudioContextClass();

    if (audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {});
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = 880;
    gainNode.gain.value = 0.04;

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.15);

    oscillator.onended = () => {
      audioContext.close().catch(() => {});
    };
  } catch (error) {
    console.log('Notification tone unavailable:', error);
  }
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      sender: 'bot', 
      text: 'Hi there! 👋 How can I help you with SeraniLux today?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const hasUserInteractedRef = useRef(false);

  useEffect(() => {
    const enableAudio = () => {
      hasUserInteractedRef.current = true;
    };

    window.addEventListener('pointerdown', enableAudio, { once: true });
    window.addEventListener('keydown', enableAudio, { once: true });

    return () => {
      window.removeEventListener('pointerdown', enableAudio);
      window.removeEventListener('keydown', enableAudio);
    };
  }, []);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized]);
  
  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);
  
  // Handle unread messages
  useEffect(() => {
    if (!isOpen || isMinimized) {
      // If there's a new bot message and chat is closed/minimized
      const newBotMessages = messages.filter(msg => 
        msg.sender === 'bot' && 
        !msg.read && 
        new Date(msg.timestamp) > (new Date().getTime() - 5000) // Messages from last 5 seconds
      );
      if (newBotMessages.length > 0) {
        setUnreadCount(count => count + newBotMessages.length);
        playNotificationTone(hasUserInteractedRef.current);
      }
    }
  }, [messages, isOpen, isMinimized]);
  
  // Mark messages as read when opening chat
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setUnreadCount(0);
      setMessages(prevMessages => 
        prevMessages.map(msg => ({ ...msg, read: true }))
      );
    }
  }, [isOpen, isMinimized]);
  
  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatContainerRef.current && !chatContainerRef.current.contains(event.target)) {
        if (isOpen && !isMinimized) {
          setIsMinimized(true);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isMinimized]);

  const toggleChat = () => {
    if (isOpen) {
      if (isMinimized) {
        setIsMinimized(false);
      } else {
        setIsMinimized(true);
      }
    } else {
      setIsOpen(true);
      setIsMinimized(false);
    }
  };
  
  const closeChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const trimmedInput = inputValue.trim();
    if (!trimmedInput) return;

    const userMessage = { 
      sender: 'user', 
      text: trimmedInput,
      timestamp: new Date(),
      read: true
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Add a small delay to show loading indicator for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const response = await axios.post('/api/chat/message', {
        message: trimmedInput
      });

      const botMessage = { 
        sender: 'bot', 
        text: response.data.reply,
        timestamp: new Date(),
        read: !isMinimized && isOpen
      };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error("Error sending message:", error);
      
      // More user-friendly error message
      const errorMessageText = error.response?.status === 503 
        ? 'Our service is temporarily unavailable. Please try again in a moment.'
        : error.response?.data?.error || 'Something went wrong. Please try again later.';
          
      const errorMessage = { 
        sender: 'bot', 
        text: errorMessageText, 
        isError: true,
        timestamp: new Date(),
        read: !isMinimized && isOpen
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };
  
  // Helper to format message timestamps
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Placeholder suggestions for quick responses
  const suggestions = [
    "What is SeraniLux?",
    "How can I get started?",
    "Tell me about pricing",
    "Contact support"
  ];
  
  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  return (
    <ChatContainer ref={chatContainerRef}>
      {/* Chat Window */}
      <Collapse in={isOpen} timeout={300} sx={{ width: '100%', alignItems: 'flex-end', display: 'flex' }}>
        <ChatWindow elevation={3}>
          <ChatHeader>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ position: 'relative', mr: 1.5 }}>
                <Avatar alt="SeraniLux Logo" src="/logo192.png" sx={{ width: 40, height: 40 }} />
                <StatusIndicator />
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight="medium">SeraniLux Assistant</Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>Usually replies within minutes</Typography>
              </Box>
            </Box>
            <Box>
              {!isMinimized ? (
                <>
                  <IconButton 
                    size="small" 
                    onClick={() => setIsMinimized(true)}
                    sx={{ color: 'inherit', mr: 0.5 }}
                    aria-label="Minimize Chat"
                  >
                    <MinimizeIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={closeChat}
                    sx={{ color: 'inherit' }}
                    aria-label="Close Chat"
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </>
              ) : (
                <IconButton 
                  size="small" 
                  onClick={() => setIsMinimized(false)}
                  sx={{ color: 'inherit' }}
                  aria-label="Expand Chat"
                >
                  <OpenInFullIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </ChatHeader>
          
          {!isMinimized && (
            <>
              <ChatMessages>
                {messages.map((msg, index) => (
                  <ListItem 
                    key={index}
                    sx={{ 
                      display: 'flex', 
                      justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                      p: 0.5
                    }}
                  >
                    <MessageBubble isUser={msg.sender === 'user'} sx={{
                      ...(msg.isError && {
                        backgroundColor: 'error.light',
                        color: 'error.contrastText'
                      })
                    }}>
                      <Typography variant="body2">
                        {typeof msg.text === 'string' ? msg.text.split('\n').map((line, i) => (
                          <React.Fragment key={i}>
                            {line}
                            {i < msg.text.split('\n').length - 1 && <br />}
                          </React.Fragment>
                        )) : 'Invalid message format'}
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5, opacity: 0.7 }}>
                        {formatTime(msg.timestamp)}
                      </Typography>
                    </MessageBubble>
                  </ListItem>
                ))}
                
                {isLoading && (
                  <ListItem sx={{ justifyContent: 'flex-start', p: 0.5 }}>
                    <TypingIndicator>
                      <span></span>
                      <span></span>
                      <span></span>
                    </TypingIndicator>
                  </ListItem>
                )}
                
                <div ref={messagesEndRef} />
              </ChatMessages>
              
              {/* Suggestions */}
              {messages.length < 3 && (
                <SuggestionsContainer>
                  <Typography variant="body2" sx={{ mb: 1 }}>Try asking:</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {suggestions.map((suggestion, index) => (
                      <Chip 
                        key={index}
                        label={suggestion}
                        onClick={() => handleSuggestionClick(suggestion)}
                        variant="outlined"
                        size="small"
                        clickable
                      />
                    ))}
                  </Box>
                </SuggestionsContainer>
              )}
              
              <ChatInputForm onSubmit={handleSendMessage}>
                <TextField
                  inputRef={inputRef}
                  fullWidth
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  variant="standard"
                  size="small"
                  sx={{ mr: 1 }}
                  InputProps={{
                    disableUnderline: true
                  }}
                />
                <IconButton 
                  type="submit" 
                  color="primary"
                  disabled={isLoading || !inputValue.trim()}
                  sx={{ 
                    opacity: inputValue.trim() ? 1 : 0.5
                  }}
                  size="small"
                >
                  {isLoading ? <CircularProgress size={20} /> : <SendIcon />}
                </IconButton>
              </ChatInputForm>
              
              <Divider />
              <Box sx={{ p: 1, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Powered by SeraniLux AI
                </Typography>
              </Box>
            </>
          )}
        </ChatWindow>
      </Collapse>

      {/* Chat Toggle Button */}
      <Badge badgeContent={unreadCount} color="error" overlap="circular">
        <Fab
          color="primary"
          size="medium"
          onClick={toggleChat}
          aria-label={isOpen ? 'Toggle Chat' : 'Open Chat'}
          id="seranilux-chat-toggle"
        >
          {isOpen && !isMinimized ? <CloseIcon /> : <ChatIcon />}
        </Fab>
      </Badge>
    </ChatContainer>
  );
};

export default Chatbot;