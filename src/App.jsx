import React, { useState } from 'react'
import logo from './assets/Logo.png'
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
  const [isExpanded, setExpanded] = useState(true);
  const [isModelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [text, setText] = useState("");
  const maxChars = 1500;

  const menuItems = [
    { name: 'AI Chat', icon: chat },
    { name: 'AI Video', icon: video },
    { name: 'AI Image', icon: image },
    { name: 'AI Development', icon: code },
  ];

  return (
    <div className="h-screen w-screen flex overflow-hidden">

      {/* SIDEBAR */}
      <div className={`fixed h-screen bg-[#121212] transition-all duration-300 ${isExpanded ? 'w-[20%]' : 'w-20'}`}>
        <nav className='bg-[#121212] p-4 h-full flex flex-col'>
          {/* Logo + Toggle */}
          <div className={`flex flex-row items-center ${!isExpanded ? 'justify-center' : 'justify-between'}`}>
            <div className={`${!isExpanded && 'hidden'}`}>
              <img className='bg-black' src={logo} alt="" />
            </div>
            <div onClick={() => setExpanded(!isExpanded)} className='cursor-pointer'>
              <img src={sidebar} alt="" />
            </div>
          </div>

          {/* Menu */}
          <div className='flex-1 flex flex-col overflow-hidden mt-6'>
            <dl>
              <dt>
                <p className={`text-[#595959] text-sm font-medium mt-4 mb-2  ${!isExpanded && 'hidden'}`}> General</p>
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
                      className={`transition-all group-hover:opacity-100 group-hover:brightness-0 group-hover:invert ${activeItem === item.name ? 'opacity-100 brightness-0 invert' : 'opacity-50'} ${!isExpanded ? 'w-5 h-5 mr-0' : 'mr-3 w-5 h-5'}`}
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
                {[
                  'Describe the benefits for a.....',
                  'Generate a list current we......',
                  'Condense the following se....',
                  'Describe what post moder.....',
                ].map((text, index) => (
                  <div key={index} className={`flex flex-row items-center cursor-pointer mb-2 border-2 border-[#3f3f3f] rounded-md hover:bg-[#2a2a2a] hover:text-white group p-3 ${!isExpanded ? 'justify-center' : 'justify-start'}`}>
                    <img src={inbox} alt="" className={`${!isExpanded ? 'mr-0' : 'mr-2'}`} />
                    <div className={`overflow-hidden w-full ${!isExpanded && 'hidden'}`}>
                      <p className='text-[#6b6b6b] truncate group-hover:text-white text-sm'>{text}</p>
                    </div>
                  </div>
                ))}
              </dd>
            </dl>
          </div>

          {/* Upgrade Plan + Profile */}
          <div className='flex flex-col gap-4 mt-auto pt-4'>
            <div className={`bg-gradient-to-r from-[#4956F4] to-[#2A328E] rounded-xl flex flex-col gap-3 ${!isExpanded ? 'p-2 items-center' : 'p-4'}`}>
              <div className={`flex flex-row items-start ${!isExpanded ? 'gap-0 justify-center' : 'gap-3'}`}>
                <img src={help} alt="" className='w-12 h-12 shrink-0' />
                {isExpanded && (
                  <div>
                    <h1 className='text-white text-sm font-semibold'>Upgrade Plan</h1>
                    <p className='text-gray-300 text-xs'>More access to the best models</p>
                  </div>
                )}
              </div>
              {isExpanded && (
                <button className='bg-white text-black text-sm font-medium py-2 rounded-lg w-full'>
                  Upgrade Plan
                </button>
              )}
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
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isExpanded ? 'ml-[20%]' : 'ml-20'}`}>

        {/* TOP BAR (FIXED) */}
        <div className={`fixed top-0 flex justify-end items-center p-4 bg-[#121212] z-50 transition-all duration-300 ${isExpanded ? 'left-[20%] w-[80%]' : 'left-20 w-[calc(100%-5rem)]'}`}>
          <div className='flex items-center gap-3'>
            <div className='relative'>
              <div
                onClick={() => setModelDropdownOpen(!isModelDropdownOpen)}
                className='flex items-center gap-2 bg-[#1a1a1a] text-white px-4 py-2 rounded-lg text-sm font-medium border border-[#333] hover:bg-[#333] transition-colors cursor-pointer select-none'
              >
                <img src={superai} alt="" className="w-5 h-5" />
                <button>Super AI 2.0</button>
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
            <button className='bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors'>
              + New Chat
            </button>
          </div>
        </div>

        {/* CONTENT (CENTERED, DOES NOT SCROLL) */}
        <div className="flex-1 flex justify-center items-center bg-[#121212]">
          <div className='flex flex-col justify-center items-center gap-10'>

            {/* Top Section */}
            <div className='flex flex-col justify-center items-center'>
              <img src={useravatar} alt="" />
              <p className='text-[#aeaeae] text-sm'>Good Morning John</p>
              <h1 className='text-white text-2xl font-semibold'>
                How can I assist you today?
              </h1>
            </div>

            {/* Cards Section */}
            <div className='w-[70%]'>
              <div className='grid grid-cols-2 gap-3 lg:grid-cols-3 p-4'>
                <div className='bg-[#3c3c3c] border-[#292929] border-2 rounded-lg p-5 flex flex-col gap-3 '>
                  <img src={logomark} alt="" className='w-12 h-12' />
                  <p className='text-[#6c6c6c] text-sm font-semibold'>
                    Help Me to Create A Personal Branding And Web Page
                  </p>
                </div>

                <div className='bg-[#3c3c3c] border-[#292929] border-2 rounded-lg p-5 flex flex-col gap-3'>
                  <img src={logomark1} alt="" className='w-12 h-12' />
                  <p className='text-[#6c6c6c] text-sm font-semibold'>
                    Write A Report Based On My Website Data
                  </p>
                </div>

                <div className='bg-[#3c3c3c] border-[#292929] border-2 rounded-lg p-5 flex flex-col gap-3'>
                  <img src={logomark3} alt="" className='w-12 h-12' />
                  <p className='text-[#6c6c6c] text-sm font-semibold'>
                    Write A Tailored, Engaging Content, With A Focus Quality
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM CHAT INPUT (FIXED) */}
        <div className={`fixed bottom-0 flex justify-center bg-transparent transition-all duration-300 ${isExpanded ? 'left-[20%] w-[80%]' : 'left-20 w-[calc(100%-5rem)]'}`}>
          <div className="w-full max-w-5xl mx-auto mb-4 px-6">
            <div className="bg-[#2a2a2a] rounded-xl border border-[#3a3a3a] p-4">
              <textarea
                rows={3}
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={maxChars}
                placeholder="Ask me anything..."
                className="w-full resize-none bg-transparent text-white placeholder-gray-400 focus:outline-none text-sm leading-relaxed pr-24"
              />
              <div className="flex items-center justify-between mt-3">
                <div className="text-xs text-gray-400 flex gap-4">
                  <span>📎 Add content</span>
                  <span>🌐 Language</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">
                    {text.length}/{maxChars}
                  </span>
                  <button
                    className="w-9 h-9 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition disabled:opacity-50"
                    disabled={!text.trim()}
                  >
                    <IoArrowForward className="text-black bg-white text-lg" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}

export default App;
