
import React, { useState, useRef, useEffect } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import Button from './Button';
import { ChatBubbleBottomCenterTextIcon, XMarkIcon, PaperAirplaneIcon } from '../constants';
import { fetchComplaintById, submitComplaint } from '../services/complaintService';

interface Message {
    sender: 'user' | 'bot';
    text: string;
    actions?: ActionButton[];
}

interface ActionButton {
    text: string;
    handler: () => void;
}

type ConversationState = 'greeting' | 'collecting_category' | 'collecting_description' | 'collecting_location' | 'collecting_contact' | 'confirming_submission' | 'submitting' | 'submitted_success' | 'tracking_prompt' | 'tracking_loading';
type ComplaintData = { category: string; description: string; location: string; contact: string; };

const Chatbot: React.FC = () => {
  const { t, lang } = useLocalization();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // State machine for conversation flow
  const [conversationState, setConversationState] = useState<ConversationState>('greeting');
  const [complaintData, setComplaintData] = useState<Partial<ComplaintData>>({});

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  
  const resetConversation = () => {
    setConversationState('greeting');
    setComplaintData({});
    setMessages([
        { 
            sender: 'bot', 
            text: t('chatbotWelcome'), 
            actions: [
                { text: t('chatbotNewComplaint'), handler: () => handleAction('submit') },
                { text: t('chatbotTrack'), handler: () => handleAction('track') }
            ]
        }
    ]);
  };
  
  useEffect(() => {
    if (isOpen) {
        resetConversation();
    }
  }, [isOpen, t]);

  const addMessage = (sender: 'user' | 'bot', text: string, actions?: ActionButton[]) => {
      setMessages(prev => [...prev, { sender, text, actions }]);
  }

  const handleAction = (action: 'submit' | 'track' | 'confirm' | 'cancel') => {
      // Hide buttons after click
      setMessages(prev => prev.map(m => ({ ...m, actions: undefined })));
      
      if (action === 'submit') {
          addMessage('user', t('chatbotNewComplaint'));
          addMessage('bot', t('chatbotAskCategory'));
          setConversationState('collecting_category');
      } else if (action === 'track') {
          addMessage('user', t('chatbotTrack'));
          addMessage('bot', t('chatbotAskTrackID'));
          setConversationState('tracking_prompt');
      } else if (action === 'confirm') {
          addMessage('user', t('chatbotConfirmComplaint'));
          submitComplaintFlow();
      } else if (action === 'cancel') {
          addMessage('user', t('chatbotCancel'));
          resetConversation();
      }
  };
  
  const submitComplaintFlow = async () => {
      setConversationState('submitting');
      setIsLoading(true);
      addMessage('bot', t('chatbotSubmitting'));

      const complaintPayload = new FormData();
      Object.entries(complaintData).forEach(([key, value]) => {
          // FIX: Add type guard as Object.entries returns a value of type any/unknown.
          if (value && typeof value === 'string') {
            complaintPayload.append(key, value);
          }
      });
      complaintPayload.append('language', lang);

      try {
          const result = await submitComplaint(complaintPayload);
          addMessage('bot', `${t('chatbotSuccess')} ${result.ticketId}`);
          setConversationState('submitted_success');
      } catch (error) {
          addMessage('bot', "Sorry, there was an error submitting your complaint. Please try again later.");
          resetConversation();
      } finally {
          setIsLoading(false);
      }
  };

  const handleSend = async () => {
    const userInput = input.trim();
    if (userInput === '' || isLoading) return;
    
    addMessage('user', userInput);
    setInput('');
    setIsLoading(true);

    // --- State Machine Logic ---
    switch(conversationState) {
        case 'collecting_category':
            setComplaintData(prev => ({ ...prev, category: userInput }));
            setConversationState('collecting_description');
            addMessage('bot', t('chatbotAskDescription'));
            break;
        case 'collecting_description':
            setComplaintData(prev => ({ ...prev, description: userInput }));
            setConversationState('collecting_location');
            addMessage('bot', t('chatbotAskLocation'));
            break;
        case 'collecting_location':
            setComplaintData(prev => ({ ...prev, location: userInput }));
            setConversationState('collecting_contact');
            addMessage('bot', t('chatbotAskContact'));
            break;
        case 'collecting_contact':
            if (!/^[6-9]\d{9}$/.test(userInput)) {
                 addMessage('bot', t('validMobileRequired'));
            } else {
                const finalData = { ...complaintData, contact: userInput };
                setComplaintData(finalData);
                setConversationState('confirming_submission');
                const summary = `Category: ${finalData.category}\nDescription: ${finalData.description}\nLocation: ${finalData.location}\nContact: ${finalData.contact}`;
                addMessage('bot', `${t('chatbotConfirm')}\n\n${summary}`, [
                    { text: t('chatbotConfirmComplaint'), handler: () => handleAction('confirm')},
                    { text: t('chatbotCancel'), handler: () => handleAction('cancel')}
                ]);
            }
            break;
        case 'tracking_prompt':
            setConversationState('tracking_loading');
            const complaint = await fetchComplaintById(userInput);
            if(complaint) {
                addMessage('bot', `${t('chatbotStatusIs')} ${complaint.status}.`);
            } else {
                addMessage('bot', t('chatbotComplaintNotFound'));
            }
            setTimeout(resetConversation, 2000);
            break;
        default:
            addMessage('bot', t('chatbotInvalidInput'));
            setTimeout(resetConversation, 2000);
            break;
    }
    setIsLoading(false);
  };

  return (
    <>
      <div className={`fixed bottom-6 right-6 z-50 transition-transform duration-300 ${isOpen ? 'scale-0' : 'scale-100'}`}>
        <Button 
            variant="primary" 
            onClick={() => setIsOpen(true)}
            className="rounded-full !p-4 shadow-lg"
            aria-label="Open chatbot"
        >
          <ChatBubbleBottomCenterTextIcon className="h-8 w-8 text-neutral-white" />
        </Button>
      </div>

      <div className={`fixed bottom-6 right-6 z-50 w-[calc(100%-3rem)] max-w-sm h-[70vh] bg-neutral-white rounded-lg shadow-2xl flex flex-col transition-transform duration-300 origin-bottom-right ${isOpen ? 'scale-100' : 'scale-0'}`}>
        <header className="bg-gov-blue-900 text-neutral-white p-4 flex justify-between items-center rounded-t-lg">
          <h3 className="font-bold text-lg">Support Chat</h3>
          <button onClick={() => setIsOpen(false)} aria-label="Close chatbot">
            <XMarkIcon className="h-6 w-6"/>
          </button>
        </header>
        <div className="flex-1 p-4 overflow-y-auto bg-neutral-light-gray">
          {messages.map((msg, index) => (
            <div key={index} className={`flex flex-col mb-3 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`rounded-lg px-4 py-2 max-w-[90%] whitespace-pre-wrap ${msg.sender === 'user' ? 'bg-gov-blue-500 text-white' : 'bg-neutral-gray text-neutral-dark-gray'}`}>
                {msg.text}
              </div>
              {msg.actions && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                      {msg.actions.map(action => (
                          <button key={action.text} onClick={action.handler} className="bg-gov-blue-500 text-white text-sm px-3 py-1 rounded-full hover:bg-gov-blue-900 transition-colors">
                              {action.text}
                          </button>
                      ))}
                  </div>
              )}
            </div>
          ))}
          {isLoading && (
             <div className="flex justify-start">
                 <div className="rounded-lg px-4 py-2 max-w-[80%] bg-neutral-gray text-neutral-dark-gray">
                    <span className="animate-pulse">...</span>
                 </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t border-neutral-gray flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 border-neutral-gray rounded-lg px-4 py-2 focus:ring-2 focus:ring-gov-blue-500 focus:outline-none"
            disabled={isLoading || conversationState === 'greeting' || conversationState === 'confirming_submission'}
          />
          <Button onClick={handleSend} disabled={isLoading || input.trim() === ''} variant="primary" className="!px-4 ml-2" aria-label="Send message">
            <PaperAirplaneIcon className="h-5 w-5"/>
          </Button>
        </div>
      </div>
    </>
  );
};

export default Chatbot;