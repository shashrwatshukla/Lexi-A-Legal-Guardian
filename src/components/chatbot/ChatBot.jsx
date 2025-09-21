'use client';

import { useEffect, useState, useRef } from 'react';
import './Chatbot.css';

export default function ChatBot() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState(null);
  const [documentAnalysis, setDocumentAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const currentlySpeakingRef = useRef(null);
  const fileInputRef = useRef(null);
  const isProcessingFileRef = useRef(false);
  const documentAnalysisRef = useRef(null);
  const conversationHistoryRef = useRef([]);

  
  
  const [hasCheckedMainDoc, setHasCheckedMainDoc] = useState(false);

  useEffect(() => {
    
    const checkForMainPageDocument = () => {
      if (document.body.classList.contains('show-chatbot') && !hasCheckedMainDoc) {
        const mainPageDocument = sessionStorage.getItem('uploadedDocument');
        if (mainPageDocument) {
          const docData = JSON.parse(mainPageDocument);

          
          setTimeout(() => {
            const chatBody = document.querySelector('.chat-body');
            if (chatBody) {
              
              const existingNotice = Array.from(chatBody.querySelectorAll('.message-text')).find(
                el => el.textContent.includes('I noticed you uploaded')
              );

              if (!existingNotice) {
                const botAvatar = `<svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
                  <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"></path>
                </svg>`;
                const noticeContent = `
                  ${botAvatar}
                  <div class="message-text">📄 I noticed you uploaded <strong>"${docData.fileName}"</strong> on the main page. <br>Please re-upload the same document here using the 📎 paperclip icon for me to analyze it and answer your questions.
                  </div>`;
                const noticeDiv = document.createElement('div');
                noticeDiv.className = 'message bot-message';
                noticeDiv.innerHTML = noticeContent;
                chatBody.appendChild(noticeDiv);
                chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
              }
            }
          }, 500);

          setHasCheckedMainDoc(true);
        }
      }
    };

    
    const observer = new MutationObserver(() => {
      checkForMainPageDocument();
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });

    
    checkForMainPageDocument();

    return () => {
      observer.disconnect();
    };
  }, [hasCheckedMainDoc]);

  useEffect(() => {
    console.log('Chatbot component mounted');

    
    setTimeout(() => {
      setShowWelcome(true);
    }, 1000);

    
    const welcomeTimer = setTimeout(() => {
      setShowWelcome(false);
    }, 6000);

    
    const handleClickOutside = (e) => {
      if (!e.target.closest('.welcome-popup') && !e.target.closest('#chatbot-toggler')) {
        setShowWelcome(false);
      }
    };
    document.addEventListener('click', handleClickOutside);

    
    if (!document.querySelector('link[href*="Material+Symbols"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200';
      document.head.appendChild(link);
    }

    
    const emojiScript = document.createElement('script');
    emojiScript.src = 'https://cdn.jsdelivr.net/npm/emoji-mart@latest/dist/browser.js';
    emojiScript.async = true;
    emojiScript.onload = () => {
      console.log('Emoji script loaded');
      initializeChatbot();
    };
    document.body.appendChild(emojiScript);

    
    const initializeChatbot = () => {
      console.log('Initializing chatbot...');

      const chatBody = document.querySelector(".chat-body");
      const messageInput = document.querySelector(".message-input");
      const sendMessageButton = document.querySelector("#send-message");
      const fileInput = document.querySelector("#file-input");
      const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
      const fileCancelButton = document.querySelector("#file-cancel");
      const chatbotToggler = document.querySelector("#chatbot-toggler");
      const closeChatbot = document.querySelector("#close-chatbot");
      const emojiPickerBtn = document.querySelector("#emoji-picker");
      const voiceInputBtn = document.querySelector("#voice-input");

      if (!chatbotToggler) {
        console.error('Chatbot toggler not found!');
        return;
      }

      
      fileInputRef.current = fileInput;

      
      const API_KEY = process.env.NEXT_PUBLIC_GEMINI_CHATBOT_API_KEY || '';
      if (!API_KEY) {
        console.warn('Gemini API key not found in environment variables');
      }
      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

      const userData = { message: null, mime_type: null, file: {} };
      let recognition = null;
      let isRecording = false;

      
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');

          messageInput.value = transcript;
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          isRecording = false;
          voiceInputBtn?.classList.remove('recording');
        };

        recognition.onend = () => {
          isRecording = false;
          voiceInputBtn?.classList.remove('recording');
        };
      }

      
      const speakText = (text, button) => {
        if ('speechSynthesis' in window) {
          
          if (currentlySpeakingRef.current === button) {
            window.speechSynthesis.cancel();
            button.classList.remove('speaking');
            currentlySpeakingRef.current = null;
            return;
          }

          
          window.speechSynthesis.cancel();
          if (currentlySpeakingRef.current) {
            currentlySpeakingRef.current.classList.remove('speaking');
          }

          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.95;
          utterance.pitch = 1.1;
          utterance.volume = 0.9;

          
          const voices = window.speechSynthesis.getVoices();
          const femaleVoice = voices.find(voice =>
            (voice.name.includes('Female') || voice.name.includes('Samantha') ||
              voice.name.includes('Victoria') || voice.name.includes('Karen') ||
              voice.name.includes('Google US English Female')) &&
            voice.lang.includes('en')
          );

          if (femaleVoice) {
            utterance.voice = femaleVoice;
          }

          button.classList.add('speaking');
          currentlySpeakingRef.current = button;

          utterance.onend = () => {
            button.classList.remove('speaking');
            currentlySpeakingRef.current = null;
          };

          window.speechSynthesis.speak(utterance);
        }
      };

      
      const createMessageElement = (content, ...classes) => {
        const div = document.createElement("div");
        div.classList.add("message", ...classes);
        div.innerHTML = content;
        return div;
      };

      
      const addSpeakButton = (messageDiv, text) => {
        const speakBtn = document.createElement('button');
        speakBtn.className = 'speak-button';
        speakBtn.innerHTML = '<span class="material-symbols-outlined">volume_up</span>';
        speakBtn.title = 'Read aloud';
        speakBtn.onclick = () => speakText(text, speakBtn);

        const messageText = messageDiv.querySelector('.message-text');
        messageText.appendChild(speakBtn);
      };

      
      const analyzeDocument = async (file) => {
        try {
          setIsAnalyzing(true);

          const formData = new FormData();
          formData.append('file', file);

          const response = await fetch('/api/document-process', {
            method: 'POST',
            body: formData,
          });

          const data = await response.json();

          if (data.success && data.analysis) {
            setDocumentAnalysis(data.analysis);
            documentAnalysisRef.current = data.analysis;
            return data.analysis;
          } else {
            throw new Error(data.error || 'Analysis failed');
          }
        } catch (error) {
          console.error('Document analysis error:', error);
          throw error;
        } finally {
          setIsAnalyzing(false);
        }
      };

      
      const generateBotResponse = async (incomingMessageDiv) => {
        const messageElement = incomingMessageDiv.querySelector(".message-text");

        try {
          
          const messages = [];


          
          if (documentAnalysisRef.current) {
            const analysis = documentAnalysisRef.current;
            const systemMessage = {
              role: "user",
              parts: [{
                text: `SYSTEM CONTEXT: You are analyzing this document:
            Document Name: ${analysis.metadata?.fileName || 'Uploaded Document'}
Document Type: ${analysis.documentType}
Summary: ${analysis.summary}
Risk Level: ${analysis.riskLevel} (Score: ${analysis.overallRiskScore}/100)

Key Information:
- Parties: ${analysis.parties?.join(', ') || 'Not specified'}
- Effective Date: ${analysis.effectiveDate}
- Expiration Date: ${analysis.expirationDate}
- Main Concerns: ${analysis.finalVerdict?.mainConcerns?.join(', ') || 'None identified'}
- Recommendation: ${analysis.finalVerdict?.recommendation}

Flagged Clauses:
${analysis.flaggedClauses?.map(clause =>
                  `- ${clause.title} (${clause.severity}): ${clause.description}`
                ).join('\n') || 'No concerning clauses found'}

Document Text Extract:
${analysis.metadata?.documentText?.substring(0, 3000) || 'No text available'}

Remember this context for all following questions.`
              }]
            };
            messages.push(systemMessage);
          }

          
          conversationHistoryRef.current.forEach(msg => {
            messages.push(msg);
          });

          
          messages.push({
            role: "user",
            parts: [{ text: userData.message }]
          });

          
          conversationHistoryRef.current.push({
            role: "user",
            parts: [{ text: userData.message }]
          });

          const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: messages
            })
          };

          const response = await fetch(API_URL, requestOptions);
          const data = await response.json();

          if (!response.ok) throw new Error(data.error?.message || "API Error");

          let apiResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response. Please try again.";

          
          apiResponseText = apiResponseText
            .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>') 
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
            .replace(/\*(.*?)\*/g, '<em>$1</em>') 
            .replace(/\n/g, '<br>'); 

          messageElement.innerHTML = apiResponseText.trim();

          
          conversationHistoryRef.current.push({
            role: "model",
            parts: [{ text: apiResponseText.trim() }]
          });

          
          if (conversationHistoryRef.current.length > 20) {
            conversationHistoryRef.current = conversationHistoryRef.current.slice(-20);
          }

          
          addSpeakButton(incomingMessageDiv, apiResponseText.trim());

        } catch (error) {
          console.error("Bot error:", error);
          messageElement.innerText = "Sorry, I encountered an error. Please try again or check your internet connection.";
        }

        incomingMessageDiv.classList.remove("thinking");
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
      };

      
      const handleOutgoingMessage = (e) => {
        e.preventDefault();
        userData.message = messageInput.value.trim();
        if (!userData.message && !userData.file.data) return;

        
        window.speechSynthesis.cancel();
        if (currentlySpeakingRef.current) {
          currentlySpeakingRef.current.classList.remove('speaking');
          currentlySpeakingRef.current = null;
        }

        messageInput.value = "";

        const messageContent = `
          <div class="message-text">${userData.message}</div>
          ${userData.file.data ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="attachment" />` : ""}
        `;

        const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
        chatBody.appendChild(outgoingMessageDiv);
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

        setTimeout(() => {
          const botAvatar = `<svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
            <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"></path>
          </svg>`;
          const messageContent = `
                        ${botAvatar}
            <div class="message-text">
              <div class="thinking-indicator"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
            </div>`;
          const incomingMessageDiv = createMessageElement(messageContent, "bot-message", "thinking");
          chatBody.appendChild(incomingMessageDiv);
          chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
          
          generateBotResponse(incomingMessageDiv);
        }, 600);
      };

      
      voiceInputBtn?.addEventListener("click", () => {
        if (!recognition) {
          alert("Speech recognition is not supported in your browser.");
          return;
        }

        if (isRecording) {
          recognition.stop();
          isRecording = false;
          voiceInputBtn.classList.remove('recording');
        } else {
          recognition.start();
          isRecording = true;
          voiceInputBtn.classList.add('recording');
        }
      });

      
      messageInput?.addEventListener("keydown", (e) => {
        const userMessage = e.target.value.trim();
        if (e.key === "Enter" && !e.shiftKey && userMessage) {
          e.preventDefault();
          handleOutgoingMessage(e);
        }
      });

      sendMessageButton?.addEventListener("click", handleOutgoingMessage);

      
      const fileUploadBtn = document.querySelector("#file-upload");
      if (fileUploadBtn) {
        fileUploadBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();

          
          if (isProcessingFileRef.current) {
            console.log('File processing already in progress');
            return;
          }

          
          if (fileInput) {
            fileInput.value = "";
            fileInput.click();
          }
        });
      }

      
      fileInput?.addEventListener("change", async (e) => {
        const file = fileInput.files[0];
        if (!file || isProcessingFileRef.current) return;

        
        isProcessingFileRef.current = true;

        try {
          console.log(`Processing file: ${file.name}`);

          
          setUploadedDocument(file);
          
          conversationHistoryRef.current = [];

          
          const messageInput = document.querySelector('.message-input');
          const sendButton = document.querySelector('#send-message');
          if (messageInput) messageInput.disabled = true;
          if (sendButton) sendButton.disabled = true;

          
          const uploadingMessage = `Uploading "${file.name}"...`;
          const botAvatar = `<svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
            <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"></path>
          </svg>`;
          const uploadingContent = `
            ${botAvatar}
            <div class="message-text">
              📤 ${uploadingMessage}
            </div>`;
          const uploadingDiv = createMessageElement(uploadingContent, "bot-message");
          chatBody.appendChild(uploadingDiv);
          chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

          
          try {
            const analysis = await analyzeDocument(file);

            
            uploadingDiv.remove();

            
            const successMessage = `✅ Document "${file.name}" analyzed successfully!

📊 <strong>Analysis Summary:</strong>
- <strong>Document Type:</strong> ${analysis.documentType}
- <strong>Risk Level:</strong> ${analysis.riskLevel} (${analysis.overallRiskScore}/100)
- <strong>Key Parties:</strong> ${analysis.parties?.join(', ') || 'Not specified'}
- <strong>Main Concerns:</strong> ${analysis.finalVerdict?.mainConcerns?.length || 0} issues found
- <strong>Recommendation:</strong> ${analysis.finalVerdict?.recommendation}

You can now ask me any questions about this document!`;

            const successContent = `
              ${botAvatar}
              <div class="message-text">
                ${successMessage.replace(/\n/g, '<br>')}
              </div>`;
            const successDiv = createMessageElement(successContent, "bot-message");
            chatBody.appendChild(successDiv);
            chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

            
            const messageInput = document.querySelector('.message-input');
            const sendButton = document.querySelector('#send-message');
            if (messageInput) messageInput.disabled = false;
            if (sendButton) sendButton.disabled = false;
            
            sessionStorage.removeItem('uploadedDocument');

          } catch (analysisError) {
            
            uploadingDiv.remove();

            
            const errorContent = `
              ${botAvatar}
              <div class="message-text">
                ❌ Sorry, I couldn't analyze the document "${file.name}". ${analysisError.message || 'Please try again or upload a different document.'}
              </div>`;
            const errorDiv = createMessageElement(errorContent, "bot-message");
            chatBody.appendChild(errorDiv);
            chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

            
            setUploadedDocument(null);
            setDocumentAnalysis(null);

            
            const messageInput = document.querySelector('.message-input');
            const sendButton = document.querySelector('#send-message');
            if (messageInput) messageInput.disabled = false;
            if (sendButton) sendButton.disabled = false;
          }

        } finally {
          
          fileInput.value = "";
          isProcessingFileRef.current = false;
        }
      });

      
      fileCancelButton?.addEventListener("click", () => {
        userData.file = {};
        fileUploadWrapper.classList.remove("active");
        const img = fileUploadWrapper.querySelector("img");
        if (img) img.src = "";
      });

      
      if (window.EmojiMart && emojiPickerBtn) {
        const picker = new window.EmojiMart.Picker({
          theme: "light",
          skinTonePosition: "none",
          previewPosition: "none",
          onEmojiSelect: (emoji) => {
            const { selectionStart: start, selectionEnd: end } = messageInput;
            messageInput.setRangeText(emoji.native, start, end, "end");
            messageInput.focus();
          }
        });
        document.querySelector(".chat-form")?.appendChild(picker);

        emojiPickerBtn.addEventListener("click", () => {
          document.body.classList.toggle("show-emoji-picker");
        });
      }

      
      chatbotToggler.addEventListener("click", () => {
        console.log('Toggler clicked!');
        document.body.classList.toggle("show-chatbot");
        setShowWelcome(false);
      });

      closeChatbot?.addEventListener("click", () => {
        console.log('Close button clicked!');
        document.body.classList.remove("show-chatbot");
        window.speechSynthesis.cancel(); 
        if (currentlySpeakingRef.current) {
          currentlySpeakingRef.current.classList.remove('speaking');
          currentlySpeakingRef.current = null;
        }
      });

      console.log('Chatbot initialized successfully!');
      setIsLoaded(true);
    };

    
    setTimeout(() => {
      if (!isLoaded) {
        initializeChatbot();
      }
    }, 2000);

    
    return () => {
      clearTimeout(welcomeTimer);
      document.removeEventListener('click', handleClickOutside);
      if (document.body.contains(emojiScript)) {
        document.body.removeChild(emojiScript);
      }
      window.speechSynthesis.cancel();
    };
  }, [isLoaded]);

  return (
    <>
      {/* Welcome Popup */}
      <div className={`welcome-popup ${showWelcome ? 'show' : ''}`}>
        <p>Hi! 👋 I can help you analyze your legal documents. Click here to start.</p>
      </div>

      {/* Chatbot Toggle Button */}
      <button id="chatbot-toggler" aria-label="Toggle chatbot">
        <span className="material-symbols-outlined">mode_comment</span>
        <span className="material-symbols-outlined">close</span>
      </button>

      {/* Chatbot Popup */}
      <div className="chatbot-popup">
        {/* Header */}
        <div className="chat-header">
          <div className="header-info">
            <svg className="chatbot-logo" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
              <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"></path>
            </svg>
            <h2 className="logo-text">Ask Lexi</h2>
          </div>
          <button type="button" id="clear-chat" title="Clear chat history" onClick={() => {
            conversationHistoryRef.current = [];
            const chatBody = document.querySelector('.chat-body');
            
            const messages = chatBody.querySelectorAll('.message');
            messages.forEach((msg, index) => {
              if (index > 0) msg.remove();
            });
          }}>
            <span className="material-symbols-outlined">refresh</span>
          </button>
        </div>

        {/* Document Status Indicator */}
        {uploadedDocument && (
          <div className="document-status">
            <span className="material-symbols-outlined">description</span>
            <span>{uploadedDocument.name}</span>
            {isAnalyzing && <span className="analyzing-indicator"> (Analyzing...)</span>}
          </div>
        )}

        {/* Chat Body */}
        <div className="chat-body">
          <div className="message bot-message">
            <svg className="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
              <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"></path>
            </svg>
            <div className="message-text">
              Hello! I'm your Lexi Assistant. I can help you analyze legal documents and answer questions about them.
              <br /><br />
              📎 Upload a document using the paperclip icon below to get started!
            </div>
          </div>
        </div>

        {/* Chat Footer */}
        <div className="chat-footer">
          <form className="chat-form">
            <textarea
              className="message-input"
              placeholder={documentAnalysis ? "Ask me anything about your document..." : "Upload a document first to start chatting..."}
              required
            ></textarea>
            <div className="chat-controls">
              <div className="file-upload-wrapper">
                <button type="button" id="file-upload" aria-label="Upload file">
                  <span className="material-symbols-outlined">attach_file</span>
                </button>
                <input type="file" id="file-input" accept="image/*,.pdf,.txt,.doc,.docx" hidden />
                <img src="" alt="File preview" />
                <button type="button" id="file-cancel" aria-label="Cancel file">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <button type="button" id="emoji-picker" aria-label="Choose emoji">
                <span className="material-symbols-outlined">sentiment_satisfied</span>
              </button>
              <button type="button" id="voice-input" aria-label="Voice input">
                <span className="material-symbols-outlined">mic</span>
              </button>
              <button type="submit" id="send-message" aria-label="Send message">
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}