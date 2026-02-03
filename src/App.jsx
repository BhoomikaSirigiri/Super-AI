import React, { useState } from 'react'
import logo from './assets/logo.png'
import chat from './assets/chat.png'
import video from './assets/video.png'
import image from './assets/image.png'
import code from './assets/code.png'
import inbox from './assets/inbox.png'
import user from './assets/avatar.png'
import help from './assets/help.png'
import sidebar from './assets/sidebar.png'
import superai from './assets/superai.png'
import logomark from './assets/logomark.png'
import logomark1 from './assets/logomark1.png'
import logomark3 from './assets/logomark2.png'
import { FiChevronDown, FiImage, FiFileText, FiCamera, FiPaperclip, FiX, FiTrash2, FiSquare, FiZap, FiMail, FiLock, FiUser, FiLogOut, FiMic } from "react-icons/fi";
import useravatar from './assets/useravatar.png'
import { IoArrowForward } from "react-icons/io5";


// ⚠️ IMPORTANT: API key is now stored in .env file
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const App = () => {
  const [activeItem, setActiveItem] = useState('AI Chat');
  const [isExpanded, setExpanded] = useState(false);
  const [isModelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [isAttachmentMenuOpen, setAttachmentMenuOpen] = useState(false);
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const imageInputRef = React.useRef(null);
  const fileInputRef = React.useRef(null);
  const [currentChatId, setCurrentChatId] = useState(() => {
    return localStorage.getItem('currentChatId');
  });
  const [previousChatList, setPreviousChatList] = useState(() => {
    const saved = localStorage.getItem('chatHistoryFull');
    return saved ? JSON.parse(saved) : [];
  });
  const [messages, setMessages] = useState(() => {
    const savedId = localStorage.getItem('currentChatId');
    const savedHistory = localStorage.getItem('chatHistoryFull');
    if (savedId && savedHistory) {
      const history = JSON.parse(savedHistory);
      const activeChat = history.find(c => c.id === savedId);
      return activeChat ? activeChat.messages : [];
    }
    return [];
  });
  const [isChatting, setIsChatting] = useState(() => {
    return localStorage.getItem('currentChatId') !== null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = React.useRef(null);
  const controllerRef = React.useRef(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, chatId: null });
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('profileName') || "Nutan Sai Nandam";
  });
  const maxChars = 1500;

  const [generatedImages, setGeneratedImages] = useState([]);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('Realistic');
  const [imageUsage, setImageUsage] = useState(() => {
    const saved = localStorage.getItem('imageUsage');
    return saved ? JSON.parse(saved) : { count: 0, lastReset: Date.now() };
  });

  // --- VOICE COMMAND STATE ---
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = React.useRef(null);

  // Initialize Speech Recognition
  React.useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setText(prev => prev + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please try Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // --- NEW AUTHENTICATION STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('isLoggedIn') === 'true');
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('userEmail') || "");
  const [userProfilePic, setUserProfilePic] = useState(() => localStorage.getItem('userAvatar') || useravatar);
  const [authStep, setAuthStep] = useState('email'); // 'email' or 'otp'
  const [loginInput, setLoginInput] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // --- NEW GUEST TRIAL STATE ---
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [guestTimeLeft, setGuestTimeLeft] = useState(600); // 10 minutes (600s)
  const [isGuestChoiceMade, setIsGuestChoiceMade] = useState(false);

  React.useEffect(() => {
    let timer;
    if (isGuestMode && guestTimeLeft > 0) {
      timer = setInterval(() => {
        setGuestTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (guestTimeLeft === 0) {
      setIsGuestMode(false);
      setIsAuthenticated(false);
      localStorage.removeItem('isGuest');
    }
    return () => clearInterval(timer);
  }, [isGuestMode, guestTimeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartGuest = () => {
    setIsGuestMode(true);
    setIsAuthenticated(true); // Allow access
    setUserName("Guest Explorer");
    setUserEmail("guest@preview.com");
    setIsGuestChoiceMade(true);
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setIsAuthLoading(true);

    setTimeout(() => {
      if (authStep === 'email') {
        setAuthStep('otp');
      } else {
        // Build final name from inputs
        const fullName = `${firstName} ${lastName}`.trim();
        const mockAvatar = `https://ui-avatars.com/api/?name=${fullName}&background=random&color=fff&size=200`;

        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('profileName', fullName);
        localStorage.setItem('userEmail', loginInput);
        localStorage.setItem('userAvatar', mockAvatar);

        setUserName(fullName);
        setUserEmail(loginInput);
        setUserProfilePic(mockAvatar);
        setIsAuthenticated(true);
      }
      setIsAuthLoading(false);
    }, 1500);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('profileName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userAvatar');
    localStorage.removeItem('currentChatId');
    setIsAuthenticated(false);
    setIsChatting(false);
    setMessages([]);
    setCurrentChatId(null);
  };

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getResetTimeString = () => {
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const resetTimestamp = imageUsage.lastReset + twentyFourHours;
    return new Date(resetTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  React.useEffect(() => {
    const handleClickOutside = () => setContextMenu({ ...contextMenu, visible: false });
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [contextMenu]);

  const handleContextMenu = (e, chatId) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.pageX,
      y: e.pageY,
      chatId: chatId
    });
  };

  const deleteChat = (chatId) => {
    const updatedList = previousChatList.filter(chat => chat.id !== chatId);
    setPreviousChatList(updatedList);
    localStorage.setItem('chatHistoryFull', JSON.stringify(updatedList));

    if (currentChatId === chatId) {
      handleNewChat();
    }
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleSendMessage = async (msgOverride = null) => {
    console.log("handleSendMessage triggered", { msgOverride, text, selectedFile });

    // 1. Capture current state into local constants immediately
    const currentText = (msgOverride || text).trim();
    const currentFile = selectedFile;
    const currentPreview = filePreview;

    // 2. Validation
    if (isLoading) {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
      return;
    }

    if (!currentText && !currentFile) return;

    // --- AI Image Generation Flow ---
    if (activeItem === 'AI Image') {
      // Check for 24h reset
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      let currentUsage = { ...imageUsage };

      if (now - currentUsage.lastReset > twentyFourHours) {
        currentUsage = { count: 0, lastReset: now };
      }

      if (currentUsage.count >= 2) {
        return;
      }

      setIsGeneratingImage(true);
      const userPrompt = currentText;
      setText("");

      // Simulate API delay for "premium" feel
      setTimeout(() => {
        const mockImageUrl = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop`;
        setGeneratedImages([{ url: mockImageUrl, prompt: userPrompt, style: selectedStyle }]);

        // Update Usage
        const updatedUsage = { ...currentUsage, count: currentUsage.count + 1 };
        setImageUsage(updatedUsage);
        localStorage.setItem('imageUsage', JSON.stringify(updatedUsage));

        setIsGeneratingImage(false);
      }, 4000);
      return;
    }

    try {
      // 3. Prepare display message and attachment object
      const displayMessage = currentText || (currentFile ? `Sent ${currentFile.type}` : "");
      const currentAttachment = currentFile ? {
        type: currentFile.type,
        preview: currentPreview,
        name: currentFile.file.name
      } : null;

      const userMsgObj = {
        role: 'user',
        content: displayMessage,
        attachment: currentAttachment
      };

      // 4. Update UI immediately and clear inputs
      setMessages(prev => [...prev, userMsgObj]);
      setText("");
      setSelectedFile(null);
      setFilePreview(null);
      setIsChatting(true);
      setIsLoading(true);

      // 5. Determine or Create Chat Session ID
      let chatId = currentChatId;
      if (!chatId) {
        chatId = Date.now().toString();
        setCurrentChatId(chatId);
        localStorage.setItem('currentChatId', chatId);
      }

      // 6. Update Chat History list with User Message
      setPreviousChatList(prevList => {
        let updatedList;
        const chatExists = prevList.find(c => c.id === chatId);

        if (!chatExists) {
          // New Chat session
          const newChat = {
            id: chatId,
            title: displayMessage.substring(0, 30),
            messages: [userMsgObj]
          };
          updatedList = [newChat, ...prevList];
        } else {
          // Update Existing Chat session
          updatedList = prevList.map(chat =>
            chat.id === chatId
              ? { ...chat, messages: [...chat.messages, userMsgObj] }
              : chat
          );
        }
        localStorage.setItem('chatHistoryFull', JSON.stringify(updatedList));
        return updatedList;
      });

      // 7. API Key Check
      if (!GEMINI_API_KEY || GEMINI_API_KEY === "PASTE_YOUR_NEW_ROTATED_KEY_HERE") {
        throw new Error("Missing Gemini API Key. Please add it to the .env file.");
      }

      // 7. API Call with Memory
      controllerRef.current = new AbortController();

      // Filter and map existing messages to Gemini format (strictly alternating roles)
      const history = [];
      let lastRole = null;

      // We take the current messages (excluding the one we just added to state which isn't in 'messages' yet)
      messages.forEach(msg => {
        const role = msg.role === 'ai' ? 'model' : 'user';
        // Ensure alternating roles; Gemini API v1beta is strict about this
        if (role !== lastRole) {
          history.push({
            role: role,
            parts: [{ text: msg.content || (msg.attachment ? `Sent ${msg.attachment.type}` : "...") }]
          });
          lastRole = role;
        }
      });

      const promptText = currentText || (currentFile ? `Analyze this ${currentFile.type}` : "Please respond");
      const currentMessagePart = {
        role: 'user',
        parts: [{ text: promptText }]
      };

      // Add file data to the current message if present
      if (currentFile) {
        try {
          const base64Data = await fileToBase64(currentFile.file);

          // Determine MIME type strictly
          let mimeType = currentFile.file.type;
          if (!mimeType) {
            if (currentFile.type === 'Image') mimeType = 'image/jpeg';
            else if (currentFile.file.name.endsWith('.pdf')) mimeType = 'application/pdf';
            else if (currentFile.file.name.endsWith('.txt')) mimeType = 'text/plain';
            else mimeType = 'application/octet-stream';
          }

          currentMessagePart.parts.push({
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          });
        } catch (fileErr) {
          console.error("File processing error:", fileErr);
          throw new Error("Could not process the attached file.");
        }
      }

      // Final contents array
      const contents = [...history];
      if (lastRole === 'user') {
        contents[contents.length - 1].parts.push(...currentMessagePart.parts);
      } else {
        contents.push(currentMessagePart);
      }

      console.log("Gemini API Payload:", JSON.stringify({ contents }, null, 2));

      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY
        },
        body: JSON.stringify({ contents }),
        signal: controllerRef.current.signal
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(`${data.error.code || 'API Error'} - ${data.error.message}`);
      }

      if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
        throw new Error("No response from AI. This could be due to safety filters or an empty response.");
      }

      const aiContent = data.candidates[0].content.parts[0].text;
      const aiResponse = { role: 'ai', content: aiContent };

      setMessages(prev => [...prev, aiResponse]);

      // Update the chat history with the AI response
      setPreviousChatList(prevList => {
        const updatedList = prevList.map(chat =>
          chat.id === chatId
            ? { ...chat, messages: [...chat.messages, aiResponse] }
            : chat
        );
        localStorage.setItem('chatHistoryFull', JSON.stringify(updatedList));
        return updatedList;
      });
    } catch (error) {
      if (error.name === 'AbortError') {
        setMessages(prev => [...prev, { role: 'ai', content: "Generation stopped." }]);
      } else {
        console.error("AI Error:", error);
        const errorMessage = {
          role: 'ai',
          content: "Oops! " + error.message
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setIsLoading(false);
      controllerRef.current = null;
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    localStorage.removeItem('currentChatId');
    setIsChatting(false);
    setText("");
    setSelectedFile(null);
    setFilePreview(null);
    setModelDropdownOpen(false);
  };

  const loadChat = (chat) => {
    if (!chat || !chat.messages) return;
    setMessages(chat.messages);
    setCurrentChatId(chat.id);
    localStorage.setItem('currentChatId', chat.id);
    setIsChatting(true);
    setText("");
    setSelectedFile(null);
    setFilePreview(null);
    if (window.innerWidth < 1024) {
      setExpanded(false);
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      console.log("File detected:", file.name, type);
      setSelectedFile({ file, type });

      if (type === 'Image') {
        const reader = new FileReader();
        reader.onload = (event) => {
          setFilePreview(event.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(file.name);
      }
      setAttachmentMenuOpen(false);
      e.target.value = null; // Clear input to allow re-selection
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error("No file provided"));
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  };

  React.useEffect(() => {
    const handleResize = () => {
      setExpanded(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { name: 'AI Chat', icon: chat },
    { name: 'AI Video', icon: video, isPro: true },
    { name: 'AI Image', icon: image },
    { name: 'AI Development', icon: code },
  ];

  // --- LOGIN / GUEST SELECTION VIEW ---
  if (!isAuthenticated) {
    return (
      <div className="h-screen w-screen bg-[#0a0a0a] flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-10 duration-700">
          {!isGuestChoiceMade ? (
            <div className="bg-[#141414] border border-[#2a2a2a] rounded-[40px] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden text-center">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl rounded-full"></div>
              <img src={logo} className="h-12 mx-auto mb-8" alt="Super AI" />
              <h2 className="text-white text-3xl font-black mb-4 tracking-tight">Experience <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">Super AI</span></h2>
              <p className="text-gray-400 text-sm mb-10 leading-relaxed">
                Unlock the power of next-gen intelligence. Try it free for 10 minutes or login to save your sessions.
              </p>

              <div className="space-y-4">
                <button
                  onClick={handleStartGuest}
                  className="w-full bg-white text-black py-4 rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 shadow-xl"
                >
                  <FiZap className="text-purple-600" />
                  <span>Try Free for 10 Mins</span>
                </button>
                <div className="flex items-center gap-4 py-2">
                  <div className="h-[1px] bg-[#333] flex-1"></div>
                  <span className="text-gray-600 text-[10px] uppercase font-bold tracking-widest">or</span>
                  <div className="h-[1px] bg-[#333] flex-1"></div>
                </div>
                <button
                  onClick={() => setIsGuestChoiceMade(true)}
                  className="w-full bg-transparent border border-[#2a2a2a] text-white py-4 rounded-2xl font-bold transition-all hover:bg-white/5 active:scale-95"
                >
                  Login / Sign Up
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#141414] border border-[#2a2a2a] rounded-[40px] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
              {/* Login Form Implementation */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 blur-3xl rounded-full"></div>
              <div className="relative flex flex-col items-center">
                <img src={logo} className="h-12 mb-8" alt="Super AI" />
                <h2 className="text-white text-2xl font-bold mb-2 tracking-tight">
                  {authStep === 'email' ? 'Welcome Back' : 'Verification Needed'}
                </h2>
                <p className="text-gray-500 text-sm text-center mb-8">
                  {authStep === 'email'
                    ? 'Sign in to access your AI studio'
                    : `We've sent a code to ${loginInput}`}
                </p>

                <form onSubmit={handleAuthSubmit} className="w-full space-y-4">
                  {authStep === 'email' ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                          <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                          <input
                            required
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="First Name"
                            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                          />
                        </div>
                        <div className="relative">
                          <input
                            required
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Last Name"
                            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl py-4 px-4 text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                          />
                        </div>
                      </div>
                      <div className="relative">
                        <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                          required
                          type="email"
                          value={loginInput}
                          onChange={(e) => setLoginInput(e.target.value)}
                          placeholder="Email Address"
                          className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative">
                        <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                          required
                          type="text"
                          maxLength="6"
                          value={otpInput}
                          onChange={(e) => setOtpInput(e.target.value)}
                          placeholder="6-Digit OTP"
                          className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl py-4 pl-12 pr-4 text-white font-mono tracking-[0.5em] text-center focus:outline-none focus:border-purple-500/50 transition-colors"
                        />
                      </div>
                      <p className="text-[10px] text-purple-400/80 text-center font-medium">
                        Simulated: Use any 6-digit code like <span className="text-white">123456</span>
                      </p>
                    </div>
                  )}

                  <button
                    disabled={isAuthLoading}
                    className="w-full bg-white text-black py-4 rounded-2xl font-bold transition-transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {isAuthLoading ? (
                      <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                    ) : (
                      <span>{authStep === 'email' ? 'Continue' : 'Verify & Continue'}</span>
                    )}
                  </button>
                </form>

                <div className="flex flex-col items-center gap-4 mt-8">
                  {authStep === 'otp' && (
                    <button
                      onClick={() => setAuthStep('email')}
                      className="text-gray-500 text-xs hover:text-white transition-colors"
                    >
                      Used wrong email? Go back
                    </button>
                  )}
                  <button
                    onClick={() => { setIsGuestChoiceMade(false); setAuthStep('email'); }}
                    className="text-purple-400 text-xs font-bold hover:underline"
                  >
                    ← Back to Guest Options
                  </button>
                </div>
              </div>
            </div>
          )}
          <p className="text-center text-gray-600 text-xs mt-8">
            By continuing, you agree to our <span className="underline cursor-pointer">Terms of Service</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-screen w-screen flex overflow-hidden bg-[#121212]">
        {/* MOBILE BACKDROP */}
        {isExpanded && window.innerWidth < 1024 && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[55] lg:hidden"
            onClick={() => setExpanded(false)}
          />
        )}

        {/* SIDEBAR */}
        <div
          className={`fixed h-screen transition-all duration-300 z-[60]
        ${isExpanded
              ? 'w-full lg:w-[22%] xl:w-[18%] 2xl:w-[15%] bg-[#121212] shadow-2xl'
              : 'w-16 lg:w-16 bg-transparent lg:bg-[#121212]'
            }`}
        >
          <nav className='p-4 h-full flex flex-col'>
            {/* Logo + Toggle (Fixed Header) */}
            <div className={`flex flex-row items-center shrink-0  ${!isExpanded ? 'justify-center' : 'justify-between'}`}>
              <div className={`${!isExpanded ? 'hidden' : 'block'}`}>
                <img className=' w-full h-10 object-contain' src={logo} alt="" />
              </div>
              <div onClick={() => setExpanded(!isExpanded)} className='cursor-pointer p-1 hover:bg-[#2a2a2a] rounded-lg transition-colors'>
                {isExpanded ? (
                  <>
                    {/* Close button for medium and smaller devices when expanded */}
                    <FiX className="w-6 h-6 text-white lg:hidden" />
                    {/* Sidebar icon for large devices when expanded */}
                    <img src={sidebar} alt="" className="w-6 h-6 hidden lg:block" />
                  </>
                ) : (
                  <img src={sidebar} alt="" className="w-6 h-6" />
                )}
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className={`flex-1 flex flex-col overflow-y-auto mt-6 ${!isExpanded && 'max-lg:hidden'}`}>
              {/* Menu */}
              <dl>
                <dt>
                  <p className={`text-[#595959] text-sm font-medium mt-4 mb-2 ${!isExpanded && 'hidden'}`}> General</p>
                </dt>
                <dd className='flex flex-col mt-4 '>
                  {menuItems.map((item) => (
                    <div
                      key={item.name}
                      onClick={() => setActiveItem(item.name)}
                      className={`flex flex-row items-center cursor-pointer mb-2 p-2 border-2 hover:bg-[#2a2a2a] hover:text-white hover:border-[#3f3f3f] hover:rounded-md group ${!isExpanded ? 'justify-center p-2 border-transparent' : 'justify-start'} ${activeItem === item.name ? 'bg-[#2a2a2a] text-white border-[#3f3f3f] rounded-md' : 'text-[#6b6b6b] border-transparent'}`}
                    >
                      <img
                        src={item.icon}
                        alt=""
                        className={`transition-all group-hover:opacity-100 group-hover:brightness-0 group-hover:invert ${activeItem === item.name ? 'opacity-100 brightness-0 invert' : 'opacity-50'} w-5 h-5 ${isExpanded ? 'mr-3' : 'mr-0'}`}
                      />
                      <div className={`flex-1 min-w-0 ${!isExpanded && 'hidden'}`}>
                        <div className="flex items-center justify-between w-full">
                          <button className={`text-sm font-medium text-start truncate group-hover:text-white ${activeItem === item.name ? 'text-white' : 'text-[#6b6b6b]'}`}>
                            {item.name}
                          </button>
                          {item.isPro && (
                            <span className="bg-purple-600 text-[9px] px-1.5 py-0.5 rounded text-white font-black tracking-tighter ml-2">PRO</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </dd>
              </dl>

              {/* Previous Chats */}
              <dl className="mt-6">
                <dt>
                  <p className={`text-[#595959] text-sm font-medium mb-2 ${!isExpanded && 'hidden'}`}> Previous Chats</p>
                </dt>
                <dd className='flex flex-col mt-4'>
                  {previousChatList.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => loadChat(chat)}
                      onContextMenu={(e) => handleContextMenu(e, chat.id)}
                      className={`flex flex-row items-center gap-2 cursor-pointer mb-2 border-2 rounded-xl hover:bg-[#2a2a2a] hover:text-white group p-3 transition-all relative ${isExpanded ? 'justify-start' : 'justify-center'} ${currentChatId === chat.id ? 'bg-[#2a2a2a] text-white border-[#3f3f3f]' : 'border-transparent'}`}
                    >
                      <img src={inbox} alt="" className={`${isExpanded ? '' : ''} opacity-60 group-hover:opacity-100`} />
                      <div className={`overflow-hidden flex-1 ${!isExpanded && 'hidden'}`}>
                        <p className={`truncate text-sm group-hover:text-white ${currentChatId === chat.id ? 'text-white font-medium' : 'text-[#6b6b6b]'}`}>
                          {chat.title}
                        </p>
                      </div>

                      {/* Desktop Delete Button */}
                      {isExpanded && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteChat(chat.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all"
                          title="Delete Chat"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </dd>
              </dl>
            </div>

            {/* Upgrade Plan + Profile (Fixed Footer) */}
            <div className={`flex flex-col gap-4 shrink-0 pt-4 border-t border-[#333] ${!isExpanded && 'max-lg:hidden'}`}>
              <div className={`rounded-xl flex flex-col gap-3 transition-all duration-300 ${!isExpanded ? 'items-center bg-transparent p-0' : 'items-start bg-gradient-to-r from-[#4956F4] to-[#2A328E] p-4'}`}>
                <div className={`flex flex-row items-start gap-3`}>
                  <img src={help} alt="" className='w-8 h-8 shrink-0 object-cover rounded-full bg-white p-1.5' />
                  <div className={`${!isExpanded && 'hidden'}`}>
                    <h1 className='text-white text-sm font-semibold'>Upgrade Plan</h1>
                    <p className='text-gray-300 text-xs'>More access to the best models</p>
                  </div>
                </div>
                <button className={`bg-white text-black text-sm font-medium py-2 rounded-lg w-full ${!isExpanded && 'hidden'}`}>
                  Upgrade Now
                </button>
              </div>


              <div className={`flex items-center gap-3 p-2 bg-[#1a1a1a] rounded-2xl border border-[#333] hover:border-white/20 transition-all group ${!isExpanded ? 'justify-center w-12 h-12 p-0 bg-transparent border-none outline-none' : ''}`}>
                <img src={userProfilePic} alt="" className='w-10 h-10 object-cover rounded-full ring-2 ring-purple-500/20 shadow-lg' />
                <div className={`flex-1 min-w-0 ${!isExpanded ? 'hidden' : ''}`}>
                  <p className='text-white text-[13px] font-bold truncate leading-none mb-1 group-hover:text-purple-400 transition-colors'>{userName}</p>
                  <p className='text-gray-500 text-[10px] truncate leading-none'>{userEmail.toLowerCase()}</p>
                </div>
                {isExpanded && (
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                    title="Logout"
                  >
                    <FiLogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </nav>
        </div>

        {/* MAIN CONTENT AREA */}
        <div
          className={`flex-1 h-screen overflow-hidden flex flex-col transition-all duration-300
  ${isExpanded
              ? 'ml-0 lg:ml-72 xl:ml-64 2xl:ml-60'
              : 'ml-0 lg:ml-20'
            }`}
        >

          {/* TOP BAR (UNFIXED within flex) */}
          <div className="flex justify-between items-center p-4 bg-[#121212] z-50 shrink-0">
            {/* Guest Timer UI */}
            <div>
              {isGuestMode && (
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl shadow-xl animate-pulse">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 animate-ping"></div>
                    <span className="text-[10px] uppercase font-black text-gray-400 tracking-tighter">Guest Trial</span>
                  </div>
                  <div className="w-[1px] h-4 bg-white/10"></div>
                  <div className="text-white font-mono font-bold text-sm tracking-widest shrink-0">
                    {formatTime(guestTimeLeft)}
                  </div>
                  <div className="w-[1px] h-4 bg-white/10"></div>
                  <button
                    onClick={() => { setIsAuthenticated(false); setIsGuestMode(false); setIsGuestChoiceMade(true); }}
                    className="text-[10px] text-purple-400 font-bold hover:text-purple-300 transition-colors"
                  >
                    LOGIN NOW
                  </button>
                </div>
              )}
            </div>

            <div className='flex items-center gap-3'>
              <div className='relative'>
                <div
                  onClick={() => setModelDropdownOpen(!isModelDropdownOpen)}
                  className='flex items-center gap-2 bg-[#1a1a1a] text-white px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium border border-[#333] hover:bg-[#333] transition-colors cursor-pointer select-none'
                >
                  <img src={superai} alt="" className="w-4 h-4 md:w-5 md:h-5" />
                  <button className='max-sm:hidden'>Super AI 2.0</button>
                  <FiChevronDown className={`transition-transform duration-200 ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
                </div>

                {isModelDropdownOpen && (
                  <div className='absolute top-full mt-2 w-full min-w-[160px] bg-[#1a1a1a] border border-[#333] rounded-lg shadow-xl z-50 overflow-hidden'>
                    <div className='flex items-center gap-2 px-4 py-3 hover:bg-[#2a2a2a] cursor-pointer transition-colors'>
                      <span className='text-white text-sm'>Super AI 2.0</span>
                    </div>
                    <div className='flex items-center gap-2 px-4 py-3 hover:bg-[#2a2a2a] cursor-pointer transition-colors'>
                      <span className='text-white text-sm'>Super AI 2.0 Pro</span>
                      <span className='bg-purple-600 text-xs px-1.5 rounded text-white font-bold'>PRO</span>
                    </div>
                    <div className='flex items-center gap-2 px-4 py-3 hover:bg-[#2a2a2a] cursor-pointer transition-colors'>
                      <span className='text-white text-sm'>Super AI 3</span>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={handleNewChat}
                className='bg-white text-black px-3 py-2 rounded-lg text-sm font-bold md:font-medium hover:bg-gray-200 transition-colors flex items-center justify-center'
              >
                <span>+</span>
                <span className='hidden sm:inline ml-1 font-medium'>New Chat</span>
              </button>
            </div>
          </div>

          {/* CONTENT (SCROLLABLE) */}
          <div className="flex-1 overflow-y-auto bg-[#292929] h-screen px-4 md:px-10 pb-6">
            {activeItem === 'AI Development' ? (
              <div className="flex flex-col items-center py-6 md:py-10 animate-in fade-in duration-700">
                {/* Dev Hub Header */}
                <div className="text-center mb-10">
                  <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full mb-4">
                    <FiSquare className="text-blue-500 text-[10px]" />
                    <span className="text-blue-400 text-[10px] font-bold uppercase tracking-widest">Engineering Mode</span>
                  </div>
                  <h2 className="text-white text-3xl md:text-5xl font-black mb-4 tracking-tight">Technical <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Forge</span></h2>
                  <p className="text-gray-400 text-sm max-w-xl mx-auto">Architect, debug, and optimize complex systems with enterprise-grade AI intelligence.</p>
                </div>

                {/* Dev Workspace Mockup */}
                <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Editor Section */}
                  <div className="lg:col-span-2 bg-[#0d0d0d] border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col min-h-[500px]">
                    <div className="bg-[#1a1a1a] px-6 py-3 border-b border-white/5 flex items-center justify-between">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono">technical_spec.sh</span>
                    </div>
                    <div className="flex-1 p-8 font-mono text-sm space-y-4">
                      <p className="text-emerald-500">$ <span className="text-white">init_super_ai_core --verbose</span></p>
                      <p className="text-gray-500">{">> "}Loading neural weights... <span className="text-blue-400">[SUCCESS]</span></p>
                      <p className="text-gray-500">{">> "}Optimizing garbage collection... <span className="text-blue-400">[2.4ms]</span></p>
                      <p className="text-gray-300 ml-4 border-l border-white/10 pl-4 py-2 italic opacity-50">
                        "The most elegant code is the one you haven't written yet."
                      </p>
                      <div className="h-2 w-1/2 bg-white/5 rounded animate-pulse"></div>
                      <div className="h-2 w-3/4 bg-white/5 rounded animate-pulse delay-75"></div>
                      <div className="h-2 w-1/3 bg-white/5 rounded animate-pulse delay-150"></div>
                    </div>
                  </div>

                  {/* Sidebar Tools */}
                  <div className="flex flex-col gap-6">
                    <div className="bg-[#1a1a1a] border border-white/5 rounded-3xl p-6 shadow-xl">
                      <h4 className="text-white font-bold mb-4 text-xs uppercase tracking-widest text-blue-400">Dev Actions</h4>
                      <div className="grid grid-cols-1 gap-3">
                        {['Code Review', 'Refactor Helper', 'Debug Sandbox', 'Architecture Design'].map(tool => (
                          <button key={tool} className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-300 text-xs font-medium border border-transparent hover:border-blue-500/30 transition-all flex items-center justify-between group">
                            {tool}
                            <FiZap className="opacity-0 group-hover:opacity-100 text-blue-400 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/20 rounded-3xl p-6 relative overflow-hidden group">
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full group-hover:bg-blue-500/20 transition-all"></div>
                      <h4 className="text-white font-bold mb-2">Pro Debugger</h4>
                      <p className="text-blue-200/60 text-[10px] mb-4 leading-relaxed">Unlock advanced breakpoint analysis and stack trace visualization.</p>
                      <button className="w-full bg-white text-black py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-wider">Upgrade System</button>
                    </div>
                  </div>
                </div>

                {/* Tech Stack Icons */}
                <div className="flex flex-wrap justify-center gap-8 mt-16 grayscale opacity-20 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                  {['React', 'Node.js', 'Python', 'Rust', 'TypeScript', 'Docker'].map(tech => (
                    <span key={tech} className="text-white font-mono text-xs font-bold tracking-widest">{tech}</span>
                  ))}
                </div>
              </div>
            ) : activeItem === 'AI Video' ? (
              <div className="flex flex-col items-center py-6 md:py-20 animate-in fade-in zoom-in duration-700">
                {/* Video Studio Header */}
                <div className="text-center mb-12">
                  <div className="inline-flex items-center gap-2 bg-purple-600/10 border border-purple-500/20 px-4 py-1.5 rounded-full mb-4">
                    <FiZap className="text-purple-500 text-sm" />
                    <span className="text-purple-400 text-[10px] font-bold uppercase tracking-widest">Premium Feature</span>
                  </div>
                  <h2 className="text-white text-3xl md:text-5xl font-black mb-4 tracking-tight">AI Video <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">Studio</span></h2>
                  <p className="text-gray-400 text-sm max-w-md mx-auto">Create breathtaking cinematic videos from simple text prompts in seconds.</p>
                </div>

                {/* Pro Lock UI */}
                <div className="w-full max-w-5xl aspect-video bg-[#1a1a1a] border border-[#333] rounded-[40px] overflow-hidden shadow-2xl relative group">
                  {/* Blurred UI Placeholder */}
                  <div className="absolute inset-0 grayscale blur-md opacity-20 pointer-events-none p-12 flex flex-col gap-8">
                    <div className="h-12 w-1/3 bg-gray-700 rounded-full"></div>
                    <div className="flex-1 w-full bg-gray-800 rounded-3xl"></div>
                    <div className="h-16 w-full flex gap-4">
                      <div className="h-full flex-1 bg-gray-700 rounded-2xl"></div>
                      <div className="h-full flex-1 bg-gray-700 rounded-2xl"></div>
                      <div className="h-full flex-1 bg-gray-700 rounded-2xl"></div>
                    </div>
                  </div>

                  {/* Lock Overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-8 bg-black/40 backdrop-blur-sm">
                    <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center relative shadow-2xl">
                      <div className="absolute inset-0 bg-purple-600/20 rounded-full blur-3xl"></div>
                      <img src={video} alt="" className="w-12 h-12 relative opacity-50 contrast-125" />
                    </div>

                    <div className="space-y-3 max-w-md">
                      <h3 className="text-white text-2xl font-bold">Ready to direct?</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        Upgrade to <span className="text-white font-semibold">Super AI Pro</span> to unlock high-fidelity video generation, 4K export, and cinematic camera controls.
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 w-full max-w-xs">
                      <button className="bg-white text-black py-4 rounded-2xl font-bold text-sm shadow-[0_10px_40px_rgba(255,255,255,0.15)] hover:scale-105 transition-transform active:scale-95">
                        Get Pro Access Now
                      </button>
                      <p className="text-[10px] text-gray-500">Includes unlimited AI Images & Priority Support</p>
                    </div>
                  </div>
                </div>

                {/* Pro Features Showcase */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-16">
                  {[
                    { title: "4K Cinematic", desc: "Ultra-high resolution generation" },
                    { title: "Luma Engine", desc: "Industry leading motion physics" },
                    { title: "Voice Sync", desc: "Automated AI lip-sync feature" }
                  ].map(f => (
                    <div key={f.title} className="bg-[#1a1a1a]/50 border border-[#333] p-6 rounded-3xl">
                      <h4 className="text-white font-bold mb-1">{f.title}</h4>
                      <p className="text-gray-500 text-xs">{f.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : activeItem === 'AI Image' ? (
              <div className="flex flex-col items-center py-6 md:py-10 animate-in fade-in duration-700">
                {/* Image Lab Header */}
                <div className="text-center mb-8 relative">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#2a2a2a] border border-[#444] px-3 py-1 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Usage: {imageUsage.count}/2 Generations Used
                  </div>
                  <h2 className="text-white text-2xl md:text-3xl font-bold mb-2">AI Image Lab</h2>
                  <p className="text-gray-400 text-sm">Turn your imagination into high-quality visuals</p>
                </div>

                {/* Main Generation Canvas */}
                <div className="w-full max-w-4xl bg-[#1a1a1a] border border-[#333] rounded-3xl overflow-hidden shadow-2xl relative min-h-[300px] md:min-h-[500px] flex items-center justify-center p-6">
                  {isGeneratingImage ? (
                    <div className="flex flex-col items-center gap-6">
                      <div className="w-20 h-20 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
                      <div className="text-center">
                        <p className="text-white font-medium animate-pulse">Sculpting your vision...</p>
                        <p className="text-gray-500 text-xs mt-1 italic">Applying {selectedStyle} style</p>
                      </div>
                    </div>
                  ) : generatedImages.length > 0 ? (
                    <div className="w-full h-full flex flex-col items-center gap-6">
                      <img
                        src={generatedImages[0].url}
                        alt="Generated"
                        onLoad={() => console.log("Image loaded successfully")}
                        onError={(e) => {
                          console.log("Image failed to load, trying fallback");
                          e.target.src = "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1200";
                        }}
                        className="w-full h-full max-h-[600px] object-contain rounded-2xl shadow-2xl border border-white/5"
                      />
                      <div className="flex gap-4">
                        <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-full text-sm font-medium transition-all backdrop-blur-md border border-white/10">Download</button>
                        <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-all shadow-lg shadow-purple-900/20">Upscale 4K</button>
                        <button
                          onClick={() => setGeneratedImages([])}
                          className="bg-red-600/80 hover:bg-red-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-all shadow-lg shadow-red-900/20"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  ) : imageUsage.count >= 2 ? (
                    <div className="flex flex-col items-center text-center gap-6 p-10 bg-black/20 backdrop-blur-sm rounded-3xl border border-white/5 animate-in zoom-in duration-500">
                      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
                        <FiZap className="text-3xl text-red-500" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-white text-xl font-bold">Daily Limit Reached</h3>
                        <p className="text-gray-400 text-sm max-w-xs mx-auto">
                          You've used your 2 free generations for today. Upgrade to <span className="text-purple-400 font-bold">Pro</span> for unlimited access!
                        </p>
                      </div>
                      <button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-full text-sm font-bold shadow-xl hover:scale-105 transition-transform active:scale-95">
                        Upgrade Now
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center gap-4 opacity-40">
                      <div className="w-20 h-20 bg-[#2a2a2a] rounded-full flex items-center justify-center">
                        <FiImage className="text-4xl text-gray-500" />
                      </div>
                      <p className="text-gray-400 max-w-xs">Describe what you want to create below and watch the magic happen.</p>
                    </div>
                  )}
                </div>

                {/* Style Presets */}
                <div className="w-full max-w-4xl mt-8">
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4 ml-2">Choose Style</p>
                  <div className="flex flex-wrap gap-3">
                    {['Realistic', 'Cyberpunk', 'Cinematic', '3D Render', 'Anime', 'Oil Painting', 'Digital Art'].map(style => (
                      <button
                        key={style}
                        onClick={() => setSelectedStyle(style)}
                        className={`px-5 py-2 rounded-full text-xs font-semibold transition-all border ${selectedStyle === style ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/20' : 'bg-[#1a1a1a] border-[#333] text-gray-400 hover:border-gray-500 hover:text-white'}`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aspect Ratio & Settings */}
                <div className="w-full max-w-4xl mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#1a1a1a] border border-[#333] p-4 rounded-2xl">
                    <p className="text-gray-500 text-[10px] uppercase font-bold mb-2">Aspect Ratio</p>
                    <div className="flex gap-2">
                      <div className="w-6 h-6 border-2 border-purple-500 rounded cursor-pointer" title="1:1"></div>
                      <div className="w-8 h-6 border border-[#444] rounded cursor-pointer" title="4:3"></div>
                      <div className="w-10 h-6 border border-[#444] rounded cursor-pointer" title="16:9"></div>
                    </div>
                  </div>
                  <div className="bg-[#1a1a1a] border border-[#333] p-4 rounded-2xl">
                    <p className="text-gray-500 text-[10px] uppercase font-bold mb-2">Quality</p>
                    <p className="text-white text-xs font-medium">Standard (HD)</p>
                  </div>
                  <div className="bg-[#1a1a1a] border border-[#333] p-4 rounded-2xl">
                    <p className="text-gray-500 text-[10px] uppercase font-bold mb-2">Lighting</p>
                    <p className="text-white text-xs font-medium">Auto-Optimize</p>
                  </div>
                  <div className="bg-[#1a1a1a] border border-[#333] p-4 rounded-2xl">
                    <p className="text-gray-500 text-[10px] uppercase font-bold mb-2">Seed</p>
                    <p className="text-white text-xs font-medium">Randomized</p>
                  </div>
                </div>
              </div>
            ) : !isChatting ? (
              <div className="flex-1 flex flex-col items-center
                gap-4 sm:gap-6 md:gap-6 lg:gap-8
                w-full max-w-7xl mx-auto
                px-4 sm:px-5 md:px-6
                overflow-y-auto">

                {/* ================= TOP SECTION ================= */}
                <div className="flex flex-col items-center text-center
                  px-4 sm:px-5 md:px-6
                  pt-4 sm:pt-6 md:pt-6 lg:pt-8">

                  {/* ===== Avatar Section ===== */}
                  <div className="relative flex items-center justify-center
                    mt-2 sm:mt-4 md:mt-4 lg:mt-5">

                    {/* Glow */}
                    <div className="absolute
                      w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-44 lg:h-44
                      rounded-full bg-white/20 blur-3xl" />

                    {/* Profile Image */}
                    <img
                      src={userProfilePic}
                      alt="Profile"
                      className="relative
                   w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32
                   rounded-full object-cover"
                    />
                  </div>

                  {/* ===== Greeting Badge ===== */}
                  <div className="inline-flex items-center gap-1
                    bg-white/5 border border-white/10
                    px-2 py-1 sm:px-3 sm:py-2
                    rounded-full backdrop-blur-md
                    mt-2 shadow-sm">
                    <span className="text-sm sm:text-base md:text-sm">
                      {new Date().getHours() < 12 ? '☀️' : new Date().getHours() < 17 ? '🌤️' : '🌙'}
                    </span>
                    <p className="text-[#e0e0e0] text-[10px] sm:text-xs md:text-sm font-medium tracking-wide leading-none">
                      {getTimeBasedGreeting()},
                      <span className="text-white font-bold"> {userName}</span>
                    </p>
                  </div>

                  {/* ===== Headline ===== */}
                  <h1 className="text-white text-base sm:text-lg md:text-xl lg:text-2xl font-bold tracking-tight
                   mt-1 max-w-md md:max-w-xl lg:max-w-2xl leading-tight text-center">
                    How can I assist you{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                      today?
                    </span>
                  </h1>
                </div>

                {/* ================= SERVICE CARDS ================= */}
                <div className="w-full max-w-4xl px-4 sm:px-5 md:px-6 pb-2 sm:pb-4 md:pb-4 lg:pb-6 flex-1">

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3
                    gap-3 sm:gap-4 md:gap-4 lg:gap-6 auto-rows-fr">

                    {/* Card 1 */}
                    <div
                      onClick={() =>
                        handleSendMessage("Help Me to Create A Personal Branding And Web Page")
                      }
                      className="bg-[#3c3c3c] hover:bg-[#252525]
                   border-2 border-[#505050] hover:border-purple-500/50
                   rounded-2xl
                   p-3 sm:p-4 md:p-4 lg:p-5
                   flex flex-col gap-3 md:gap-3
                   cursor-pointer transition-all duration-300 group
                   min-h-[120px] sm:min-h-[140px] md:min-h-[130px] lg:min-h-[150px]">

                      <div className="w-10 h-10 md:w-12 md:h-12
                        bg-[#2a2a2a] rounded-xl
                        flex items-center justify-center
                        group-hover:scale-110 transition-transform">
                        <img src={logomark} alt="" className="w-5 h-5 md:w-6 md:h-6" />
                      </div>

                      <p className="text-gray-300 text-xs md:text-sm font-medium leading-relaxed">
                        Help Me to Create A Personal Branding And Web Page
                      </p>
                    </div>

                    {/* Card 2 */}
                    <div
                      onClick={() =>
                        handleSendMessage("Write A Report Based On My Website Data")
                      }
                      className="bg-[#3c3c3c] hover:bg-[#252525]
                   border-2 border-[#505050] hover:border-purple-500/50
                   rounded-2xl
                   p-3 sm:p-4 md:p-4 lg:p-5
                   flex flex-col gap-3 md:gap-3
                   cursor-pointer transition-all duration-300 group
                   min-h-[120px] sm:min-h-[140px] md:min-h-[130px] lg:min-h-[150px]">

                      <div className="w-10 h-10 md:w-12 md:h-12
                        bg-[#2a2a2a] rounded-xl
                        flex items-center justify-center
                        group-hover:scale-110 transition-transform">
                        <img src={logomark1} alt="" className="w-5 h-5 md:w-6 md:h-6" />
                      </div>

                      <p className="text-gray-300 text-xs md:text-sm font-medium leading-relaxed">
                        Write A Report Based On My Website Data
                      </p>
                    </div>

                    {/* Card 3 */}
                    <div
                      onClick={() =>
                        handleSendMessage(
                          "Write A Tailored, Engaging Content, With A Focus Quality"
                        )
                      }
                      className="bg-[#3c3c3c] hover:bg-[#252525]
                   border-2 border-[#505050] hover:border-purple-500/50
                   rounded-2xl
                   p-3 sm:p-4 md:p-4 lg:p-5
                   flex flex-col gap-3 md:gap-3
                   cursor-pointer transition-all duration-300 group
                   min-h-[120px] sm:min-h-[140px] md:min-h-[130px] lg:min-h-[150px]">

                      <div className="w-10 h-10 md:w-12 md:h-12
                        bg-[#2a2a2a] rounded-xl
                        flex items-center justify-center
                        group-hover:scale-110 transition-transform">
                        <img src={logomark3} alt="" className="w-5 h-5 md:w-6 md:h-6" />
                      </div>

                      <p className="text-gray-300 text-xs md:text-sm font-medium leading-relaxed">
                        Write A Tailored, Engaging Content, With A Focus Quality
                      </p>
                    </div>

                  </div>
                </div>

              </div>

            ) : (
              <div className="max-w-4xl mx-auto flex flex-col gap-8">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] md:max-w-[75%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-[#2a2a2a] text-white' : 'bg-[#1a1a1a] border border-[#333] text-gray-100 shadow-lg'}`}>
                      <div className="flex items-center gap-2 mb-3 border-b border-gray-800 pb-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center overflow-hidden">
                          <img src={msg.role === 'user' ? userProfilePic : superai} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs uppercase tracking-wider font-bold text-gray-500">
                          {msg.role === 'user' ? userName : 'Super AI 2.0'}
                        </span>
                      </div>
                      {msg.attachment && (
                        <div className="mb-3">
                          {msg.attachment.type === 'Image' ? (
                            <img
                              src={msg.attachment.preview}
                              alt="attachment"
                              className="max-h-60 rounded-lg border border-gray-700 object-cover"
                            />
                          ) : (
                            <div className="flex items-center gap-2 p-2 bg-black/20 rounded-lg border border-gray-700 w-fit">
                              <FiFileText className="text-green-500" />
                              <span className="text-xs truncate max-w-[200px]">{msg.attachment.name}</span>
                            </div>
                          )}
                        </div>
                      )}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start mb-6">
                    <div className="bg-[#1a1a1a] border border-[#333] p-4 rounded-2xl animate-pulse">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* BOTTOM CHAT INPUT (STABLE) */}
          <div className="w-full bg-[#292929] shrink-0 border-t border-[#333]/30">
            <div className="w-full max-w-5xl mx-auto py-4 px-3 md:px-6">
              <div className="bg-[#1a1a1a]/80 backdrop-blur-xl rounded-2xl border border-[#333] p-3 md:p-4 shadow-2xl">
                <textarea
                  rows={window.innerWidth < 768 ? 2 : 3}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  maxLength={maxChars}
                  disabled={activeItem === 'AI Image' && imageUsage.count >= 2}
                  placeholder={activeItem === 'AI Image' && imageUsage.count >= 2
                    ? `You can use after 24 Hours at ${getResetTimeString()}`
                    : "Ask me anything..."}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className={`w-full resize-none bg-transparent text-white focus:outline-none text-xs md:text-sm leading-relaxed pr-12 md:pr-24 ${activeItem === 'AI Image' && imageUsage.count >= 2 ? 'placeholder:text-white opacity-100 cursor-not-allowed' : 'placeholder-gray-500'}`}
                />

                {/* FILE PREVIEW AREA */}
                {filePreview && (
                  <div className="mt-2 mb-2 p-2 bg-[#2a2a2a] rounded-xl flex items-center gap-3 relative group w-fit max-w-full">
                    {selectedFile?.type === 'Image' ? (
                      <img src={filePreview} alt="upload preview" className="h-16 w-16 object-cover rounded-lg border border-[#444]" />
                    ) : (
                      <div className="h-16 w-16 bg-[#333] rounded-lg flex flex-col items-center justify-center text-[10px] text-gray-400 p-1 text-center truncate">
                        <FiFileText className="text-xl mb-1 text-green-500" />
                        <span className="w-full truncate">{filePreview}</span>
                      </div>
                    )}
                    <button
                      onClick={() => { setSelectedFile(null); setFilePreview(null); }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                    >
                      <FiX className="text-xs" />
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between mt-2 md:mt-3 border-t border-[#333] pt-2 md:pt-3">
                  <div className="text-xs text-gray-400 flex gap-3 md:gap-4 relative">
                    <div className="relative">
                      <button
                        onClick={() => setAttachmentMenuOpen(!isAttachmentMenuOpen)}
                        className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors"
                      >
                        <FiPaperclip className="text-sm md:text-base" />
                        <span>Attach</span>
                      </button>

                      {/* ATTACHMENT MENU */}
                      {isAttachmentMenuOpen && (
                        <div className="absolute bottom-full mb-4 left-0 bg-[#1a1a1a] border border-[#333] rounded-2xl shadow-2xl p-2 min-w-[180px] z-[70] overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                          <div className="flex flex-col gap-1">
                            {/* Menu items only trigger the hidden inputs below */}
                            <label
                              htmlFor="image-upload"
                              className="flex items-center gap-3 px-4 py-3 hover:bg-[#252525] rounded-xl transition-colors text-gray-300 hover:text-white text-xs md:text-sm text-left cursor-pointer"
                            >
                              <FiCamera className="text-purple-500" />
                              <span>Take Photo</span>
                            </label>
                            <label
                              htmlFor="image-upload"
                              className="flex items-center gap-3 px-4 py-3 hover:bg-[#252525] rounded-xl transition-colors text-gray-300 hover:text-white text-xs md:text-sm text-left cursor-pointer"
                            >
                              <FiImage className="text-blue-500" />
                              <span>Add Image</span>
                            </label>
                            <label
                              htmlFor="doc-upload"
                              className="flex items-center gap-3 px-4 py-3 hover:bg-[#252525] rounded-xl transition-colors text-gray-300 hover:text-white text-xs md:text-sm text-left cursor-pointer"
                            >
                              <FiFileText className="text-green-500" />
                              <span>Document</span>
                            </label>
                            <div className="h-[1px] bg-[#333] my-1 mx-2"></div>
                            <label
                              htmlFor="doc-upload"
                              className="flex items-center gap-3 px-4 py-3 hover:bg-[#252525] rounded-xl transition-colors text-gray-400 hover:text-white text-xs text-left cursor-pointer"
                            >
                              <FiPaperclip className="text-gray-500" />
                              <span>Library</span>
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="cursor-pointer hover:text-white transition-colors max-sm:hidden">🌐 Settings</span>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3">
                    <span className="text-xs text-gray-500">
                      {text.length}/{maxChars}
                    </span>
                    {/* VOICE INPUT BUTTON */}
                    <button
                      onClick={toggleVoiceInput}
                      className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all active:scale-95 z-[90] ${isListening ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50' : 'bg-[#2a2a2a] text-gray-400 hover:text-white hover:bg-[#333]'}`}
                      title={isListening ? "Stop listening" : "Voice input"}
                    >
                      <FiMic className={`text-lg ${isListening ? 'animate-bounce' : ''}`} />
                    </button>
                    <button
                      onClick={handleSendMessage}
                      className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all active:scale-95 z-[90] ${isLoading || isGeneratingImage ? 'bg-red-500 text-white' : activeItem === 'AI Image' ? (imageUsage.count >= 2 ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'bg-purple-600 text-white shadow-lg shadow-purple-500/30') : 'bg-white text-black hover:bg-gray-200'} ${(!text.trim() && !selectedFile && !isLoading && !isGeneratingImage) || (activeItem === 'AI Image' && imageUsage.count >= 2) ? 'opacity-30 cursor-not-allowed' : 'opacity-100 cursor-pointer'}`}
                      disabled={isLoading || isGeneratingImage || (activeItem === 'AI Image' && imageUsage.count >= 2) ? (isLoading || isGeneratingImage ? false : true) : (!text.trim() && !selectedFile)}
                      title={activeItem === 'AI Image' ? (imageUsage.count >= 2 ? "24h Limit Reached" : "Generate Image") : "Send message"}
                    >
                      {isLoading || isGeneratingImage ? <FiSquare className="text-xs fill-current" /> : activeItem === 'AI Image' ? <FiZap className="text-lg" /> : <IoArrowForward className="text-lg" />}
                    </button>
                  </div>
                </div>
              </div>
              <p className='text-center text-xs text-gray-600 mt-2 max-sm:hidden'>
                AI can make mistakes. Check important info.
              </p>
            </div>
          </div>

        </div>
        {/* Hidden Inputs (Located at the very bottom for maximum stability) */}
        <input
          id="image-upload"
          type="file"
          ref={imageInputRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => handleFileChange(e, 'Image')}
        />
        <input
          id="doc-upload"
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          onChange={(e) => handleFileChange(e, 'Document')}
        />

        {/* CUSTOM CONTEXT MENU */}
        {contextMenu.visible && (
          <div
            className="fixed z-[100] bg-[#1a1a1a] border border-[#333] rounded-xl shadow-2xl overflow-hidden min-w-[150px] animate-in fade-in zoom-in-95 duration-100"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button
              onClick={() => deleteChat(contextMenu.chatId)}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-[#2a2a2a] hover:text-white transition-colors text-sm font-medium"
            >
              <FiTrash2 />
              <span>Delete Chat</span>
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default App;
