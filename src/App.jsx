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
import logomark from './assets/Logomark.png'
import logomark1 from './assets/Logomark1.png'
import logomark3 from './assets/Logomark2.png'
import { FiChevronDown } from "react-icons/fi";
import useravatar from './assets/useravatar.png'
import { IoArrowForward } from "react-icons/io5";

const App = () => {
  const [activeItem, setActiveItem] = useState('AI Chat');
  const [isExpanded, setExpanded] = useState(false);
  const [isModelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [previousChatList, setPreviousChatList] = useState([
    'Describe the benefits for a.....',
    'Generate a list current we......',
    'Condense the following se....',
    'Describe what post moder.....',
  ]);
  const [isChatting, setIsChatting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = React.useRef(null);
  const maxChars = 1500;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (msgOverride = null) => {
    const userMessage = (msgOverride || text).trim();
    if (!userMessage || isLoading) return;

    const newMessages = [...messages, { role: 'user', content: userMessage }];

    setMessages(newMessages);
    setText("");
    setIsChatting(true);
    setIsLoading(true);

    if (messages.length === 0) {
      setPreviousChatList(prev => [userMessage.substring(0, 30) + "...", ...prev]);
    }

    // Advanced Mock AI Logic
    setTimeout(() => {
      let aiContent = "";
      const lowerMsg = userMessage.toLowerCase();

      if (lowerMsg.includes("branding") || lowerMsg.includes("web page")) {
        aiContent = "That's a great goal! To create a strong personal brand, we should start by defining your unique value proposition. For the web page, I recommend a clean, minimalist design using React and Tailwind CSS. Would you like me to draft a structure for your homepage?";
      } else if (lowerMsg.includes("report") || lowerMsg.includes("data")) {
        aiContent = "I can certainly help you synthesize your website data into a comprehensive report. I'll focus on key metrics like user engagement, bounce rates, and conversion paths. Please paste the raw data or describe the specific trends you've noticed.";
      } else if (lowerMsg.includes("content") || lowerMsg.includes("quality")) {
        aiContent = "Quality content is king! I can help you craft engaging, SEO-optimized articles or social media posts. What's the primary audience you're targeting, and what tone should we strike (e.g., professional, witty, or inspirational)?";
      } else {
        aiContent = `I appreciate your message about "${userMessage}". As Super AI 2.0, I've analyzed your request and can provide deep insights. Let's start by breaking this down into three actionable steps. Which part should we focus on first?`;
      }

      const aiResponse = { role: 'ai', content: aiContent };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1200);
  };

  const handleNewChat = () => {
    setMessages([]);
    setIsChatting(false);
    setText("");
    setModelDropdownOpen(false);
  };

  React.useEffect(() => {
    setExpanded(window.innerWidth >= 1024);
  }, []);

  const menuItems = [
    { name: 'AI Chat', icon: chat },
    { name: 'AI Video', icon: video },
    { name: 'AI Image', icon: image },
    { name: 'AI Development', icon: code },
  ];

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-[#121212]">
      {/* MOBILE BACKDROP */}
      {isExpanded && window.innerWidth < 1024 && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[55] lg:hidden"
          onClick={() => setExpanded(false)}
        />
      )}

      {/* SIDEBAR */}
      <div className={`fixed h-screen transition-all duration-300 z-[60] 
        ${isExpanded ? 'w-[280px] lg:w-[20%] bg-[#121212] shadow-2xl' : 'w-16 lg:w-20 lg:bg-[#121212] bg-transparent'}`}>
        <nav className='p-4 h-full flex flex-col'>
          {/* Logo + Toggle */}
          <div className={`flex flex-row items-center ${!isExpanded ? 'justify-center' : 'justify-between'}`}>
            <div className={`${!isExpanded ? 'hidden' : 'block'}`}>
              <img className='bg-black' src={logo} alt="" />
            </div>
            <div onClick={() => setExpanded(!isExpanded)} className='cursor-pointer'>
              <img src={sidebar} alt="" className="w-6 h-6" />
            </div>
          </div>

          {/* Menu */}
          <div className={`flex-1 flex flex-col overflow-hidden mt-6 ${!isExpanded && 'max-lg:hidden'}`}>
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
                      <button className={`text-sm font-medium text-start truncate w-full group-hover:text-white ${activeItem === item.name ? 'text-white' : 'text-[#6b6b6b]'}`}>
                        {item.name}
                      </button>
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
                {previousChatList.map((chatTitle, index) => (
                  <div key={index} className={`flex flex-row items-center cursor-pointer mb-2 border-2 border-[#3f3f3f] rounded-md hover:bg-[#2a2a2a] hover:text-white group p-3 ${isExpanded ? 'justify-start' : 'justify-center'}`}>
                    <img src={inbox} alt="" className={`${isExpanded ? 'mr-2' : ''}`} />
                    <div className={`overflow-hidden w-full ${!isExpanded && 'hidden'}`}>
                      <p className='text-[#6b6b6b] truncate group-hover:text-white text-sm'>{chatTitle}</p>
                    </div>
                  </div>
                ))}
              </dd>
            </dl>
          </div>

          {/* Upgrade Plan + Profile */}
          <div className={`flex flex-col gap-4 mt-auto pt-4 ${!isExpanded && 'max-lg:hidden'}`}>
            <div className={`rounded-xl flex flex-col gap-3 transition-all duration-300 ${!isExpanded ? 'items-center bg-transparent p-0' : 'items-start bg-gradient-to-r from-[#4956F4] to-[#2A328E] p-4'}`}>
              <div className={`flex flex-row items-start gap-3`}>
                <img src={help} alt="" className='w-10 h-10 shrink-0' />
                <div className={`${!isExpanded && 'hidden'}`}>
                  <h1 className='text-white text-sm font-semibold'>Upgrade</h1>
                  <p className='text-gray-300 text-xs'>Best models</p>
                </div>
              </div>
              <button className={`bg-white text-black text-sm font-medium py-2 rounded-lg w-full ${!isExpanded && 'hidden'}`}>
                Upgrade
              </button>
            </div>


            <div className={`flex flex-row items-center gap-3 p-2 ${!isExpanded && 'justify-center'}`}>
              <img src={user} alt="" className='w-10 h-10 rounded-full' />
              <div className={`flex flex-col overflow-hidden ${!isExpanded && 'hidden'}`}>
                <h2 className='text-white text-sm font-medium truncate'>Nutan Sai Nandam</h2>
                <p className='text-[#6b6b6b] text-xs truncate'>nutansainandam.com</p>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isExpanded ? 'lg:ml-[20%] ml-0' : 'ml-0 lg:ml-20'}`}>

        {/* TOP BAR (FIXED) */}
        <div className={`fixed top-0 flex justify-end items-center p-4 bg-[#121212] z-50 transition-all duration-300 
          ${isExpanded ? 'lg:left-[20%] lg:w-[80%] left-0 w-full' : 'left-0 lg:left-20 w-full lg:w-[calc(100%-5rem)]'}`}>
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
                    <span className='bg-purple-600 text-[10px] px-1.5 rounded text-white font-bold'>PRO</span>
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
        <div className="flex-1 overflow-y-auto bg-[#121212] pt-24 pb-40 px-4 md:px-10">
          {!isChatting ? (
            <div className='flex flex-col justify-center items-center gap-10 min-h-full'>
              {/* Top Section */}
              <div className='flex flex-col justify-center items-center text-center px-4'>
                <img src={useravatar} alt="" className='w-16 h-16 md:w-20 md:h-20 mb-2' />
                <p className='text-[#aeaeae] text-xs md:text-sm'>Good Morning John</p>
                <h1 className='text-white text-xl md:text-2xl font-semibold mt-1'>
                  How can I assist you today?
                </h1>
              </div>

              {/* Service Cards Section */}
              <div className='w-full max-w-4xl px-4 md:px-0'>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6'>
                  <div
                    onClick={() => handleSendMessage("Help Me to Create A Personal Branding And Web Page")}
                    className='bg-[#1a1a1a] hover:bg-[#252525] border border-[#333] hover:border-purple-500/50 rounded-2xl p-4 md:p-6 flex flex-col gap-3 md:gap-4 cursor-pointer transition-all duration-300 group'
                  >
                    <div className='w-10 h-10 md:w-12 md:h-12 bg-[#2a2a2a] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform'>
                      <img src={logomark} alt="" className='w-5 h-5 md:w-6 md:h-6' />
                    </div>
                    <p className='text-gray-300 text-xs md:text-sm font-medium leading-relaxed'>
                      Help Me to Create A Personal Branding And Web Page
                    </p>
                  </div>

                  <div
                    onClick={() => handleSendMessage("Write A Report Based On My Website Data")}
                    className='bg-[#1a1a1a] hover:bg-[#252525] border border-[#333] hover:border-purple-500/50 rounded-2xl p-4 md:p-6 flex flex-col gap-3 md:gap-4 cursor-pointer transition-all duration-300 group'
                  >
                    <div className='w-10 h-10 md:w-12 md:h-12 bg-[#2a2a2a] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform'>
                      <img src={logomark1} alt="" className='w-5 h-5 md:w-6 md:h-6' />
                    </div>
                    <p className='text-gray-300 text-xs md:text-sm font-medium leading-relaxed'>
                      Write A Report Based On My Website Data
                    </p>
                  </div>

                  <div
                    onClick={() => handleSendMessage("Write A Tailored, Engaging Content, With A Focus Quality")}
                    className='bg-[#1a1a1a] hover:bg-[#252525] border border-[#333] hover:border-purple-500/50 rounded-2xl p-4 md:p-6 flex flex-col gap-3 md:gap-4 cursor-pointer transition-all duration-300 group'
                  >
                    <div className='w-10 h-10 md:w-12 md:h-12 bg-[#2a2a2a] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform'>
                      <img src={logomark3} alt="" className='w-5 h-5 md:w-6 md:h-6' />
                    </div>
                    <p className='text-gray-300 text-xs md:text-sm font-medium leading-relaxed'>
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
                        <img src={msg.role === 'user' ? user : superai} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500">
                        {msg.role === 'user' ? 'Guest Explorer' : 'Super AI 2.0'}
                      </span>
                    </div>
                    <p className="text-sm md:text-[15px] leading-relaxed whitespace-pre-wrap font-medium">
                      {msg.content}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
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

        {/* BOTTOM CHAT INPUT (FIXED) */}
        <div className={`fixed bottom-0 flex justify-center bg-transparent transition-all duration-300 
          ${isExpanded ? 'lg:left-[20%] lg:w-[80%] left-0 w-full' : 'left-0 lg:left-20 w-full lg:w-[calc(100%-5rem)]'}`}>
          <div className="w-full max-w-5xl mx-auto mb-2 md:mb-4 px-3 md:px-6">
            <div className="bg-[#1a1a1a]/80 backdrop-blur-xl rounded-2xl border border-[#333] p-3 md:p-4 shadow-2xl">
              <textarea
                rows={window.innerWidth < 768 ? 2 : 3}
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={maxChars}
                placeholder="Ask me anything..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="w-full resize-none bg-transparent text-white placeholder-gray-500 focus:outline-none text-xs md:text-sm leading-relaxed pr-12 md:pr-24"
              />
              <div className="flex items-center justify-between mt-2 md:mt-3 border-t border-[#333] pt-2 md:pt-3">
                <div className="text-[10px] md:text-xs text-gray-400 flex gap-3 md:gap-4">
                  <span className="cursor-pointer hover:text-white transition-colors">📎 Attach</span>
                  <span className="cursor-pointer hover:text-white transition-colors max-sm:hidden">🌐 Settings</span>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <span className="text-[10px] md:text-xs text-gray-500">
                    {text.length}/{maxChars}
                  </span>
                  <button
                    onClick={handleSendMessage}
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-gray-200 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                    disabled={!text.trim() || isLoading}
                  >
                    <IoArrowForward className="text-lg" />
                  </button>
                </div>
              </div>
            </div>
            <p className='text-center text-[10px] text-gray-600 mt-2 max-sm:hidden'>
              AI can make mistakes. Check important info.
            </p>
          </div>
        </div>

      </div>

    </div>
  )
}

export default App;
