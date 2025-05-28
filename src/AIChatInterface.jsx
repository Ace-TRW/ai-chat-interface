import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Plus,
  Settings,
  ChevronRight,
  MoreVertical,
  Copy,
  RefreshCw,
  Edit2,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  X,
  Check,
  Loader,
  Coins,
  CreditCard,
  MessageSquare,
  Sparkles,
  Bot,
  User,
  Pin,
  AlertCircle,
  Clock,
  ArrowDown,
  Square,
  Wallet,
  Timer,
  DollarSign,
  History,
  ChevronDown,
  Paperclip,
  Mic,
  CheckSquare,
  Send,
  ArrowLeft,
  StopCircle,
  Menu,
} from "lucide-react";
import { styles } from "./styles";
import Sidebar from "./components/Sidebar";

// Message pack constants for consistency
const MESSAGE_PACK_OPTIONS = [
  { packName: "100 Messages", price: 1.0, messages: 100, perMessage: 0.01 },
  { packName: "250 Messages", price: 2.0, messages: 250, perMessage: 0.008 },
  { packName: "1000 Messages", price: 7.5, messages: 1000, perMessage: 0.0075 },
  {
    packName: "5000 Messages",
    price: 33.0,
    messages: 5000,
    perMessage: 0.0066,
  },
];

const AIChatInterface = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [activeChat, setActiveChat] = useState("chat-1");
  const [isTyping, setIsTyping] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showChatMenu, setShowChatMenu] = useState(null);
  const [selectedModel, setSelectedModel] = useState("gpt-4");
  const [editingTitle, setEditingTitle] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showOutOfMessagesModal, setShowOutOfMessagesModal] = useState(false);

  // Mobile responsiveness state
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const [messageAllowance, setMessageAllowance] = useState({
    freeUsed: 0,
    freeTotal: 30,
    purchasedAvailable: 0, // Back to 0 - users start with no purchased messages
  });
  const [walletBalance, setWalletBalance] = useState(0.0);
  const [autoRefillMessages, setAutoRefillMessages] = useState({
    enabled: false,
    thresholdMessages: 5,
    packToPurchase: MESSAGE_PACK_OPTIONS[0], // Default to first option
  });
  const [resetTimer, setResetTimer] = useState({
    hours: 2,
    minutes: 45,
    seconds: 30,
  });
  const [messageFeedback, setMessageFeedback] = useState({});
  const [hoveredMessage, setHoveredMessage] = useState(null);

  // Refs for auto-scroll
  const chatAreaRef = useRef(null);
  const messagePacksRef = useRef(null);
  const settingsRef = useRef(null);

  // Sample chat data - Start empty for new user experience
  const [chats, setChats] = useState([]);

  const [messages, setMessages] = useState([]);

  // Add new state for platform integration
  const [platformCardInfo, setPlatformCardInfo] = useState(null);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [showPurchaseModal, setShowPurchaseModal] = useState(null);
  const [selectedPurchaseMethod, setSelectedPurchaseMethod] =
    useState("wallet");

  // Mobile detection and window resize handler
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      // Close sidebar on desktop
      if (window.innerWidth > 768) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMobile &&
        sidebarOpen &&
        !event.target.closest(".sidebar") &&
        !event.target.closest(".mobile-menu-button")
      ) {
        setSidebarOpen(false);
      }
    };

    if (sidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isMobile, sidebarOpen]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobile, sidebarOpen]);

  // Simulate fetching platform card (in a real app, from API/context)
  useEffect(() => {
    setPlatformCardInfo({
      type: "Visa",
      last4: "1234",
      expires: "12/25",
      id: "card_xyz",
    });
  }, []);

  // Update reset timer
  useEffect(() => {
    const timer = setInterval(() => {
      setResetTimer((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { hours: prev.hours, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          // Reset free messages when timer reaches 0
          setMessageAllowance((prev) => ({
            ...prev,
            freeUsed: 0,
          }));
          return { hours: 2, minutes: 59, seconds: 59 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatAreaRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatAreaRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

      // Only auto-scroll if user is near the bottom
      if (isNearBottom) {
        chatAreaRef.current.scrollTop = scrollHeight;
      }
    }
  }, [messages]);

  // Auto-scroll new messages to top when sent
  useEffect(() => {
    if (chatAreaRef.current && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];

      // If the last message is from user (just sent), scroll to show it at the top
      if (lastMessage.role === "user") {
        // Find the last message element
        const messageElements =
          chatAreaRef.current.querySelectorAll("[data-message-id]");
        const lastMessageElement = messageElements[messageElements.length - 1];

        if (lastMessageElement) {
          // Scroll so the new message appears at the top of the visible area
          const chatAreaTop = chatAreaRef.current.offsetTop;
          const messageTop = lastMessageElement.offsetTop;
          const targetScrollTop = messageTop - chatAreaTop - 20; // 20px padding from top

          chatAreaRef.current.scrollTo({
            top: Math.max(0, targetScrollTop),
            behavior: "smooth",
          });
        }
      }
      // For AI responses, scroll to bottom to show the complete response
      else if (lastMessage.role === "assistant" && !isTyping) {
        chatAreaRef.current.scrollTo({
          top: chatAreaRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }
  }, [messages, isTyping]);

  // Load messages when activeChat changes
  useEffect(() => {
    const currentChat = chats.find((c) => c.id === activeChat);
    if (currentChat) {
      setMessages(currentChat.messages || []);
    } else if (chats.length > 0 && !activeChat) {
      // If no active chat but chats exist, activate the first one
      setActiveChat(chats[0].id);
    } else {
      setMessages([]);
    }
  }, [activeChat, chats]);

  // Sync messages back to the active chat
  useEffect(() => {
    if (activeChat && messages.length > 0) {
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === activeChat
            ? {
                ...chat,
                messages: messages,
                preview:
                  messages[messages.length - 1]?.content.substring(0, 30) +
                    "..." || "New Chat",
                lastActive: "now",
              }
            : chat
        )
      );
    }
  }, [messages, activeChat]);

  // Calculate total messages available - only show purchased messages unless they're out
  const totalMessagesAvailable =
    messageAllowance.purchasedAvailable > 0
      ? messageAllowance.purchasedAvailable
      : messageAllowance.freeTotal - messageAllowance.freeUsed;

  // Auto-scroll functionality - simplified and more common approach
  useEffect(() => {
    if (chatAreaRef.current) {
      const { scrollHeight, clientHeight, scrollTop } = chatAreaRef.current;
      // Auto-scroll to bottom if user is already near the bottom or if it's an AI message
      const lastMessage = messages[messages.length - 1];
      if (
        scrollHeight - clientHeight <= scrollTop + 150 || // User is near bottom (150px tolerance)
        (lastMessage && lastMessage.role === "assistant" && !isTyping) // It's a new AI message
      ) {
        chatAreaRef.current.scrollTo({ top: scrollHeight, behavior: "smooth" });
      }
    }
  }, [messages, isTyping]); // Trigger on new messages or when AI stops typing

  // Handle clicking outside settings panel to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close settings if purchase modal is open
      if (showPurchaseModal) return;

      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    };

    if (showSettings) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSettings, showPurchaseModal]); // Add showPurchaseModal to dependencies

  const handleSendMessage = () => {
    if (!messageInput.trim() || totalMessagesAvailable <= 0) return;

    const newMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: messageInput.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    let currentActiveChatId = activeChat;
    let currentMessagesForChat = [...messages]; // Start with current messages if any

    // Handle chat creation or updating
    if (chats.length === 0 || !chats.find((c) => c.id === activeChat)) {
      // Create new chat
      const newChatId = `chat-${Date.now()}`;
      const newChat = {
        id: newChatId,
        title: messageInput.substring(0, 25) || "New Conversation",
        preview: messageInput.substring(0, 30) + "...",
        messages: [newMessage], // Start with the new user message
        lastActive: "now",
      };
      setChats((prevChats) => [newChat, ...prevChats]); // Add to start for recency
      setActiveChat(newChatId);
      currentActiveChatId = newChatId;
      currentMessagesForChat = [newMessage]; // Messages for this new chat
    } else {
      // Add to existing active chat
      currentMessagesForChat = [...currentMessagesForChat, newMessage];
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === currentActiveChatId
            ? {
                ...chat,
                messages: currentMessagesForChat,
                preview: newMessage.content.substring(0, 30) + "...",
                lastActive: "now",
              }
            : chat
        )
      );
    }

    setMessages(currentMessagesForChat); // Update main messages state
    setMessageInput("");
    setIsTyping(true);
    setIsGenerating(true);

    // Update message allowance (consume purchased messages first, then free)
    setMessageAllowance((prev) => {
      if (prev.purchasedAvailable > 0) {
        return { ...prev, purchasedAvailable: prev.purchasedAvailable - 1 };
      } else {
        return { ...prev, freeUsed: prev.freeUsed + 1 };
      }
    });

    // Calculate messages remaining after this send for auto-refill logic
    const messagesRemainingAfterThisSend = totalMessagesAvailable - 1;

    // Auto-refill logic with payment priority (wallet first, then card)
    if (
      autoRefillMessages.enabled &&
      messagesRemainingAfterThisSend <= autoRefillMessages.thresholdMessages &&
      totalMessagesAvailable > 0 // totalMessagesAvailable *before* this send
    ) {
      const packToBuy = autoRefillMessages.packToPurchase;
      let paymentMethodForAutoRefill = null;

      if (walletBalance >= packToBuy.price) {
        paymentMethodForAutoRefill = "wallet";
      } else if (platformCardInfo) {
        paymentMethodForAutoRefill = "platformCard";
      }

      if (paymentMethodForAutoRefill) {
        console.log(
          `Auto-refilling messages using ${paymentMethodForAutoRefill}...`
        );
        setTimeout(() => {
          handleConfirmPurchase(packToBuy, paymentMethodForAutoRefill);
          alert(
            `${packToBuy.messages} messages automatically added using ${
              paymentMethodForAutoRefill === "wallet"
                ? "Wallet Balance"
                : "your card"
            }!`
          );
        }, 100);
      } else {
        console.log(
          "Auto-refill failed: No sufficient funds in wallet and no card on file."
        );
      }
    }

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: `msg-${Date.now()}-ai`,
        role: "assistant",
        content:
          "This is a simulated AI response. In a real application, this would be generated by your AI model.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      const finalMessagesForChat = [...currentMessagesForChat, aiResponse];
      setMessages(finalMessagesForChat); // Update main messages state for UI
      setChats(
        (
          prevChats // Persist AI response to the correct chat object
        ) =>
          prevChats.map((chat) =>
            chat.id === currentActiveChatId
              ? { ...chat, messages: finalMessagesForChat }
              : chat
          )
      );
      setIsTyping(false);
      setIsGenerating(false);
    }, 2000);
  };

  const handleStopGeneration = () => {
    setIsGenerating(false);
    setIsTyping(false);
  };

  const handleDeleteChat = (chatId) => {
    setChats(chats.filter((chat) => chat.id !== chatId));
    setShowChatMenu(null);
  };

  const handleRenameChat = (chatId) => {
    // Implementation for rename functionality
    console.log("Rename chat:", chatId);
    setShowChatMenu(null);
  };

  // Purchase handling functions
  const handleBuyPack = (pack) => {
    if (walletBalance >= pack.price) {
      setSelectedPurchaseMethod("wallet");
    } else if (platformCardInfo) {
      setSelectedPurchaseMethod("platformCard");
    } else {
      setSelectedPurchaseMethod(""); // No valid payment method
    }
    setShowPurchaseModal(pack);
  };

  const handleConfirmPurchase = (pack, paymentMethod) => {
    if (paymentMethod === "wallet") {
      setWalletBalance((prev) => prev - pack.price);
    }
    // For platformCard, no balance change needed (charged to card)

    setMessageAllowance((prev) => ({
      ...prev,
      purchasedAvailable: prev.purchasedAvailable + pack.messages,
    }));

    const transaction = {
      id: `txn-${Date.now()}`,
      type: "Message Pack Purchase",
      amount: pack.price,
      method: paymentMethod === "wallet" ? "Wallet Balance" : "Card",
      date: new Date().toLocaleDateString(),
      description: `${pack.messages} messages`,
    };

    setTransactionHistory((prev) => [transaction, ...prev]);
    setShowPurchaseModal(null);
  };

  const handleGetMoreMessages = () => {
    setShowSettings(true);
    setTimeout(() => {
      messagePacksRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div
      style={{
        ...styles.container,
        ...(isMobile ? styles.containerMobile : {}),
      }}
    >
      {/* Mobile Menu Button */}
      {isMobile && !showMobileSidebar && (
        <div
          style={{
            position: "fixed",
            top: "16px",
            left: "16px",
            zIndex: 1002,
            ...styles.mobileMenuButton,
            ...styles.mobileMenuButtonVisible,
          }}
        >
          <button
            onClick={() => setShowMobileSidebar(true)}
            style={{
              ...styles.mobileMenuButton,
              ...styles.mobileMenuButtonVisible,
            }}
          >
            <Menu size={20} />
          </button>
        </div>
      )}

      {/* Sidebar Overlay for Mobile */}
      {isMobile && showMobileSidebar && (
        <div
          style={{
            ...styles.sidebarOverlay,
            ...styles.sidebarOverlayVisible,
          }}
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      <Sidebar
        styles={styles}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        chats={chats}
        activeChat={activeChat}
        setActiveChat={setActiveChat}
        showChatMenu={showChatMenu}
        setShowChatMenu={setShowChatMenu}
        setShowSettings={setShowSettings}
        showSettings={showSettings}
        handleDeleteChat={handleDeleteChat}
        handleRenameChat={handleRenameChat}
        isMobile={isMobile}
        showMobileSidebar={showMobileSidebar}
        setShowMobileSidebar={setShowMobileSidebar}
      />

      {/* Main Chat Area */}
      <div
        style={{
          ...styles.mainContent,
          ...(isMobile ? styles.mainContentMobile : {}),
        }}
      >
        <div
          style={{
            ...styles.chatHeader,
            ...(isMobile ? styles.chatHeaderMobile : {}),
          }}
        >
          <div
            style={{
              ...styles.chatHeaderInfo,
              ...(isMobile ? styles.chatHeaderInfoMobile : {}),
            }}
          >
            <MessageSquare size={20} color="#f0b86c" />
            {editingTitle ? (
              <input
                type="text"
                value={chats.find((c) => c.id === activeChat)?.title || ""}
                onChange={(e) => {
                  const newChats = chats.map((chat) =>
                    chat.id === activeChat
                      ? { ...chat, title: e.target.value }
                      : chat
                  );
                  setChats(newChats);
                }}
                onBlur={() => setEditingTitle(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setEditingTitle(false);
                  }
                }}
                style={styles.titleInput}
                autoFocus
              />
            ) : (
              <h2
                style={{
                  margin: 0,
                  fontSize: isMobile ? "16px" : "18px",
                  cursor: "pointer",
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                onClick={() => setEditingTitle(true)}
              >
                {chats.find((c) => c.id === activeChat)?.title || "New Chat"}
              </h2>
            )}
            {!isMobile && (
              <Edit2
                size={14}
                style={{ opacity: 0.5, cursor: "pointer" }}
                onClick={() => setEditingTitle(true)}
              />
            )}
          </div>
          <div
            style={{
              ...styles.modelSelector,
              ...(isMobile ? styles.modelSelectorMobile : {}),
            }}
          >
            <Sparkles size={14} />
            <span style={{ fontSize: isMobile ? "14px" : "13px" }}>
              Model: GPT 4o
            </span>
          </div>
        </div>

        <div
          style={{
            ...styles.chatArea,
            ...(isMobile ? styles.chatAreaMobile : {}),
            position: "relative",
          }}
          onScroll={(e) => {
            const { scrollTop, scrollHeight, clientHeight } = e.target;
            setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
          }}
          ref={chatAreaRef}
        >
          {messages.length === 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                gap: isMobile ? "16px" : "24px",
                padding: isMobile ? "20px" : "0",
              }}
            >
              <Bot
                size={isMobile ? 40 : 48}
                color="#f0b86c"
                style={{ opacity: 0.5 }}
              />
              <h3
                style={{
                  color: "#a0aec0",
                  fontWeight: "500",
                  fontSize: isMobile ? "18px" : "20px",
                  textAlign: "center",
                  margin: 0,
                }}
              >
                Start a conversation
              </h3>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: isMobile ? "8px" : "12px",
                  justifyContent: "center",
                  maxWidth: isMobile ? "100%" : "600px",
                }}
              >
                <button
                  style={{
                    ...styles.actionButton,
                    ...(isMobile ? styles.actionButtonMobile : {}),
                    padding: isMobile ? "12px 16px" : "10px 16px",
                    backgroundColor: "#101a22",
                  }}
                  onClick={() =>
                    setMessageInput("Create a weekly content calendar template")
                  }
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(240, 184, 108, 0.1)";
                    e.currentTarget.style.borderColor =
                      "rgba(240, 184, 108, 0.3)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#101a22";
                    e.currentTarget.style.borderColor =
                      "rgba(255, 255, 255, 0.1)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <Sparkles size={16} color="#f0b86c" />
                  {isMobile ? "Weekly Template" : "Create A Weekly Template"}
                </button>
                <button
                  style={{
                    ...styles.actionButton,
                    ...(isMobile ? styles.actionButtonMobile : {}),
                    padding: isMobile ? "12px 16px" : "10px 16px",
                    backgroundColor: "#101a22",
                  }}
                  onClick={() =>
                    setMessageInput("Help me organize my daily tasks")
                  }
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(240, 184, 108, 0.1)";
                    e.currentTarget.style.borderColor =
                      "rgba(240, 184, 108, 0.3)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#101a22";
                    e.currentTarget.style.borderColor =
                      "rgba(255, 255, 255, 0.1)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <Clock size={16} />
                  {isMobile
                    ? "Organize Tasks"
                    : "Help Me Organize My Daily Tasks"}
                </button>
                <button
                  style={{
                    ...styles.actionButton,
                    ...(isMobile ? styles.actionButtonMobile : {}),
                    padding: isMobile ? "12px 16px" : "10px 16px",
                    backgroundColor: "#101a22",
                  }}
                  onClick={() =>
                    setMessageInput("Generate a project checklist")
                  }
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(240, 184, 108, 0.1)";
                    e.currentTarget.style.borderColor =
                      "rgba(240, 184, 108, 0.3)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#101a22";
                    e.currentTarget.style.borderColor =
                      "rgba(255, 255, 255, 0.1)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <CheckSquare size={16} />
                  {isMobile
                    ? "Project Checklist"
                    : "Generate Project Checklist"}
                </button>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                ...styles.messageGroup,
                ...(isMobile ? styles.messageGroupMobile : {}),
              }}
            >
              <div
                style={{
                  ...styles.message,
                  ...(isMobile ? styles.messageMobile : {}),
                }}
                data-message-id={message.id}
                onMouseEnter={() => setHoveredMessage(message.id)}
                onMouseLeave={() => setHoveredMessage(null)}
              >
                <div
                  style={{
                    ...styles.messageAvatar,
                    ...(isMobile ? styles.messageAvatarMobile : {}),
                  }}
                >
                  {message.role === "user" ? (
                    <User size={isMobile ? 16 : 18} />
                  ) : (
                    <Bot size={isMobile ? 16 : 18} color="#f0b86c" />
                  )}
                </div>
                <div
                  style={{
                    ...styles.messageContent,
                    ...(isMobile ? styles.messageContentMobile : {}),
                  }}
                >
                  <div
                    style={{
                      ...styles.messageHeader,
                      ...(isMobile ? styles.messageHeaderMobile : {}),
                    }}
                  >
                    <span
                      style={{
                        ...styles.messageName,
                        ...(isMobile ? styles.messageNameMobile : {}),
                      }}
                    >
                      {message.role === "user" ? "You" : "AI Assistant"}
                    </span>
                    <span
                      style={{
                        ...styles.messageTime,
                        ...(isMobile ? styles.messageTimeMobile : {}),
                      }}
                    >
                      {message.timestamp}
                    </span>
                  </div>
                  <div
                    style={{
                      ...styles.messageText,
                      ...(isMobile ? styles.messageTextMobile : {}),
                    }}
                  >
                    {editingMessage === message.id ? (
                      <div>
                        <textarea
                          defaultValue={message.content}
                          style={{
                            ...styles.textInput,
                            width: "100%",
                            padding: "8px",
                            minHeight: "60px",
                            backgroundColor: "#101a22",
                            border: "1px solid rgba(240, 184, 108, 0.5)",
                            borderRadius: "6px",
                          }}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              const newContent = e.target.value;
                              const updatedMessages = messages.map((m) =>
                                m.id === message.id
                                  ? { ...m, content: newContent }
                                  : m
                              );
                              setMessages(updatedMessages);
                              setEditingMessage(null);
                            }
                            if (e.key === "Escape") {
                              setEditingMessage(null);
                            }
                          }}
                        />
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            marginTop: "8px",
                            fontSize: "12px",
                            color: "#6b7280",
                          }}
                        >
                          <span>Press Enter to save, Esc to cancel</span>
                        </div>
                      </div>
                    ) : (
                      message.content
                    )}
                  </div>
                  {/* Reserved space for message actions - always present but only visible on hover/mobile */}
                  <div
                    style={{
                      height: isMobile ? "auto" : "32px",
                      display: "flex",
                      alignItems: "center",
                      opacity:
                        hoveredMessage === message.id || isMobile ? 1 : 0,
                      transition: "opacity 0.2s ease",
                    }}
                  >
                    <div
                      style={{
                        ...styles.messageActions,
                        ...(isMobile ? styles.messageActionsMobile : {}),
                      }}
                    >
                      <button
                        style={{
                          ...styles.actionButton,
                          ...(isMobile ? styles.actionButtonMobile : {}),
                        }}
                        onClick={() => {
                          navigator.clipboard.writeText(message.content);
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "rgba(255, 255, 255, 0.05)";
                          e.currentTarget.style.borderColor =
                            "rgba(255, 255, 255, 0.2)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.borderColor =
                            "rgba(255, 255, 255, 0.1)";
                        }}
                      >
                        <Copy size={12} />
                        Copy
                      </button>
                      {message.role === "user" ? (
                        <>
                          <button
                            style={{
                              ...styles.actionButton,
                              ...(isMobile ? styles.actionButtonMobile : {}),
                            }}
                            onClick={() =>
                              setEditingMessage(
                                editingMessage === message.id
                                  ? null
                                  : message.id
                              )
                            }
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "rgba(255, 255, 255, 0.05)";
                              e.currentTarget.style.borderColor =
                                "rgba(255, 255, 255, 0.2)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "transparent";
                              e.currentTarget.style.borderColor =
                                "rgba(255, 255, 255, 0.1)";
                            }}
                          >
                            <Edit2 size={12} />
                            Edit
                          </button>
                          <button
                            style={{
                              ...styles.actionButton,
                              ...(isMobile ? styles.actionButtonMobile : {}),
                            }}
                            onClick={() => {
                              setMessages(
                                messages.filter((m) => m.id !== message.id)
                              );
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "rgba(239, 68, 68, 0.1)";
                              e.currentTarget.style.borderColor =
                                "rgba(239, 68, 68, 0.3)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "transparent";
                              e.currentTarget.style.borderColor =
                                "rgba(255, 255, 255, 0.1)";
                            }}
                          >
                            <Trash2 size={12} />
                            Delete
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            style={{
                              ...styles.actionButton,
                              ...(isMobile ? styles.actionButtonMobile : {}),
                            }}
                            onClick={() => {
                              setIsTyping(true);
                              setIsGenerating(true);
                              setTimeout(() => {
                                const updatedMessages = messages.map((m) =>
                                  m.id === message.id
                                    ? {
                                        ...m,
                                        content:
                                          "This is a regenerated response with different content.",
                                      }
                                    : m
                                );
                                setMessages(updatedMessages);
                                setIsTyping(false);
                                setIsGenerating(false);
                              }, 1500);
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "rgba(255, 255, 255, 0.05)";
                              e.currentTarget.style.borderColor =
                                "rgba(255, 255, 255, 0.2)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "transparent";
                              e.currentTarget.style.borderColor =
                                "rgba(255, 255, 255, 0.1)";
                            }}
                          >
                            <RefreshCw size={12} />
                            Regenerate
                          </button>
                          <button
                            style={{
                              ...styles.actionButton,
                              backgroundColor:
                                messageFeedback[message.id] === "up"
                                  ? "rgba(34, 197, 94, 0.2)"
                                  : "transparent",
                              borderColor:
                                messageFeedback[message.id] === "up"
                                  ? "rgba(34, 197, 94, 0.5)"
                                  : "rgba(255, 255, 255, 0.1)",
                            }}
                            onClick={() =>
                              setMessageFeedback({
                                ...messageFeedback,
                                [message.id]: "up",
                              })
                            }
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "rgba(34, 197, 94, 0.2)";
                              e.currentTarget.style.borderColor =
                                "rgba(34, 197, 94, 0.5)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                messageFeedback[message.id] === "up"
                                  ? "rgba(34, 197, 94, 0.2)"
                                  : "transparent";
                              e.currentTarget.style.borderColor =
                                messageFeedback[message.id] === "up"
                                  ? "rgba(34, 197, 94, 0.5)"
                                  : "rgba(255, 255, 255, 0.1)";
                            }}
                          >
                            <ThumbsUp size={12} />
                          </button>
                          <button
                            style={{
                              ...styles.actionButton,
                              backgroundColor:
                                messageFeedback[message.id] === "down"
                                  ? "rgba(239, 68, 68, 0.2)"
                                  : "transparent",
                              borderColor:
                                messageFeedback[message.id] === "down"
                                  ? "rgba(239, 68, 68, 0.5)"
                                  : "rgba(255, 255, 255, 0.1)",
                            }}
                            onClick={() =>
                              setMessageFeedback({
                                ...messageFeedback,
                                [message.id]: "down",
                              })
                            }
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "rgba(239, 68, 68, 0.2)";
                              e.currentTarget.style.borderColor =
                                "rgba(239, 68, 68, 0.5)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                messageFeedback[message.id] === "down"
                                  ? "rgba(239, 68, 68, 0.2)"
                                  : "transparent";
                              e.currentTarget.style.borderColor =
                                messageFeedback[message.id] === "down"
                                  ? "rgba(239, 68, 68, 0.5)"
                                  : "rgba(255, 255, 255, 0.1)";
                            }}
                          >
                            <ThumbsDown size={12} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div style={styles.message}>
              <div style={styles.messageAvatar}>
                <Bot size={18} color="#f0b86c" />
              </div>
              <div style={styles.typingIndicator}>
                <div style={{ ...styles.typingDot, animationDelay: "0s" }} />
                <div style={{ ...styles.typingDot, animationDelay: "0.2s" }} />
                <div style={{ ...styles.typingDot, animationDelay: "0.4s" }} />
              </div>
            </div>
          )}

          {showScrollButton && (
            <button
              style={styles.scrollToBottomButton}
              onClick={(e) => {
                e.currentTarget.parentElement.scrollTop =
                  e.currentTarget.parentElement.scrollHeight;
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#1a1f2a";
                e.currentTarget.style.transform = "scale(1.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#101a22";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <ArrowDown size={20} />
            </button>
          )}
        </div>

        <div
          style={{
            ...styles.inputContainer,
            ...(isMobile ? styles.inputContainerMobile : {}),
          }}
        >
          {(() => {
            return (
              <>
                {totalMessagesAvailable <= 10 && totalMessagesAvailable > 0 && (
                  <div
                    style={{
                      ...styles.tokenWarning,
                      ...(isMobile ? styles.tokenWarningMobile : {}),
                    }}
                  >
                    <AlertCircle size={16} />
                    <span>
                      You have {totalMessagesAvailable} messages remaining.{" "}
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowSettings(true);
                        }}
                        style={{
                          color: "#f0b86c",
                          textDecoration: "underline",
                          cursor: "pointer",
                        }}
                      >
                        Get more messages
                      </a>
                    </span>
                  </div>
                )}

                {totalMessagesAvailable === 0 && (
                  <div
                    style={{
                      ...styles.tokenWarning,
                      ...(isMobile ? styles.tokenWarningMobile : {}),
                    }}
                  >
                    <AlertCircle size={16} />
                    <span>
                      You're out of messages. Free messages reset in{" "}
                      {resetTimer.hours}h {resetTimer.minutes}m{" "}
                      {resetTimer.seconds}s.{" "}
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handleGetMoreMessages();
                        }}
                        style={{
                          color: "#f0b86c",
                          textDecoration: "underline",
                          cursor: "pointer",
                        }}
                      >
                        Purchase more messages
                      </a>{" "}
                      to continue chatting now.
                    </span>
                  </div>
                )}

                <div
                  style={{
                    ...styles.inputWrapper,
                    ...(isMobile ? styles.inputWrapperMobile : {}),
                  }}
                >
                  <textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type your message..."
                    style={{
                      ...styles.textInput,
                      ...(isMobile ? styles.textInputMobile : {}),
                    }}
                    rows={1}
                  />
                  <div
                    style={{
                      display: "flex",
                      gap: isMobile ? "6px" : "8px",
                      alignItems: "center",
                    }}
                  >
                    {!isMobile && (
                      <>
                        <button
                          style={{
                            ...styles.actionButton,
                            border: "none",
                            padding: "8px",
                            backgroundColor: "transparent",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "rgba(255, 255, 255, 0.1)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "transparent")
                          }
                        >
                          <Paperclip size={18} />
                        </button>
                        <button
                          style={{
                            ...styles.actionButton,
                            border: "none",
                            padding: "8px",
                            backgroundColor: "transparent",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "rgba(255, 255, 255, 0.1)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "transparent")
                          }
                        >
                          <Mic size={18} />
                        </button>
                      </>
                    )}
                    {isGenerating ? (
                      <button
                        style={{
                          ...styles.stopButton,
                          ...(isMobile
                            ? {
                                padding: "12px 16px",
                                fontSize: "16px",
                                minWidth: "48px",
                                minHeight: "48px",
                              }
                            : {}),
                        }}
                        onClick={handleStopGeneration}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#dc2626")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "#ef4444")
                        }
                      >
                        <Square size={14} />
                        {!isMobile && "Stop"}
                      </button>
                    ) : (
                      <button
                        style={{
                          ...styles.sendButton,
                          ...(isMobile ? styles.sendButtonMobile : {}),
                          opacity:
                            messageInput.trim() && totalMessagesAvailable > 0
                              ? 1
                              : 0.5,
                          cursor:
                            messageInput.trim() && totalMessagesAvailable > 0
                              ? "pointer"
                              : "not-allowed",
                        }}
                        onClick={handleSendMessage}
                        disabled={
                          !messageInput.trim() || totalMessagesAvailable <= 0
                        }
                        onMouseEnter={(e) => {
                          if (
                            messageInput.trim() &&
                            totalMessagesAvailable > 0
                          ) {
                            e.currentTarget.style.backgroundColor = "#dc9a08";
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#f0b86c";
                        }}
                      >
                        {isMobile ? "Send" : "Send"}
                      </button>
                    )}
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* Out of Messages Modal */}
      {showOutOfMessagesModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>You've used all your messages!</h3>
            <p style={styles.modalBody}>
              Your message allowance for this period has been used. To continue
              chatting, purchase a Message Pack.
              {platformCardInfo &&
                ` Your card on file (${platformCardInfo.type} ****${platformCardInfo.last4}) will be used by default.`}
            </p>
            <div style={styles.modalButtons}>
              <button
                style={{
                  ...styles.modalButton,
                  ...styles.modalSecondaryButton,
                }}
                onClick={() => setShowOutOfMessagesModal(false)}
              >
                Later
              </button>
              <button
                style={{ ...styles.modalButton, ...styles.modalPrimaryButton }}
                onClick={() => {
                  setShowOutOfMessagesModal(false);
                  setShowSettings(true);
                }}
              >
                Go to Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div
          ref={settingsRef}
          style={{
            ...styles.settingsPanel,
            ...(isMobile ? styles.settingsPanelMobile : {}),
            transform: "translateX(0)",
          }}
        >
          <div style={styles.settingsHeader}>
            <h2 style={styles.settingsTitle}>Settings</h2>
            <button
              style={{ ...styles.settingsButton, padding: "8px" }}
              onClick={() => setShowSettings(false)}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#101a22")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <X size={20} />
            </button>
          </div>

          {/* Only show AI Assistant Usage section if user has purchased messages */}
          {messageAllowance.purchasedAvailable > 0 && (
            <div style={styles.settingsSection}>
              <h3 style={styles.sectionTitle}>AI Assistant Usage</h3>
              <div style={styles.settingsItem}>
                <div style={styles.settingsLabel}>Messages Remaining</div>
                <div style={styles.usageBar}>
                  <div style={styles.settingsValue}>
                    {messageAllowance.purchasedAvailable} Messages Available
                  </div>
                </div>
                <div style={styles.tokenBar}>
                  <div
                    style={{
                      ...styles.tokenProgress,
                      width: "100%", // Show full bar for purchased messages
                      backgroundColor: "#f0b86c",
                    }}
                  />
                </div>
              </div>
              <button
                style={styles.topUpButton}
                onClick={() => {
                  messagePacksRef.current?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
              >
                Get More Messages
              </button>
            </div>
          )}

          <div style={styles.settingsSection}>
            <h3 style={styles.sectionTitle}>Payment & Billing</h3>
            {platformCardInfo ? (
              <div
                style={{
                  ...styles.cardItem,
                  ...(isMobile ? styles.cardItemMobile : {}),
                }}
              >
                <div
                  style={{
                    ...styles.cardInfo,
                    ...(isMobile ? styles.cardInfoMobile : {}),
                  }}
                >
                  <CreditCard size={20} />
                  <div>
                    <div style={{ fontSize: "14px" }}>
                      {platformCardInfo.type} ****{platformCardInfo.last4}
                    </div>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>
                      Expires {platformCardInfo.expires}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => alert("Link to main platform billing page")}
                  style={{
                    ...styles.actionButton,
                    border: "none",
                    padding: "4px 8px",
                    fontSize: "12px",
                  }}
                >
                  Manage Card
                </button>
              </div>
            ) : (
              <>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    marginBottom: "8px",
                  }}
                >
                  To purchase message packs or enable automatic refill, please
                  add a payment card to your platform account.
                </p>
                <button
                  onClick={() =>
                    alert("TODO: Link to main platform page to add a card")
                  }
                  style={{
                    ...styles.topUpButton,
                    width: "100%",
                    marginBottom: "8px",
                  }}
                >
                  + Add Payment Card
                </button>
                <p style={{ fontSize: "12px", color: "#6b7280" }}>
                  Alternatively, you can top up your wallet with crypto and
                  purchase message packs using your wallet balance.
                </p>
              </>
            )}
          </div>

          <div style={styles.settingsSection}>
            <h3 style={styles.sectionTitle}>Wallet</h3>
            <div
              style={{
                ...styles.walletCard,
                ...(isMobile ? styles.walletCardMobile : {}),
              }}
            >
              <div style={styles.settingsLabel}>Current Balance</div>
              <div
                style={{
                  ...styles.walletBalance,
                  ...(isMobile ? styles.walletBalanceMobile : {}),
                }}
              >
                ${walletBalance.toFixed(2)} USD
              </div>
              <button
                style={{
                  ...styles.topUpButton,
                  ...(isMobile ? styles.topUpButtonMobile : {}),
                }}
              >
                <Wallet size={16} style={{ marginRight: "6px" }} />
                Top Up Wallet
              </button>
            </div>

            <div style={styles.settingsItem}>
              <h4
                style={{
                  fontSize: "14px",
                  marginBottom: "12px",
                  color: "#ffffff",
                  fontWeight: "600",
                }}
              >
                Automatic Message Refill
              </h4>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                  padding: "8px 0",
                }}
              >
                <span style={{ fontSize: "14px", color: "#ffffff" }}>
                  Enable Automatic Message Refill
                </span>
                <div
                  style={{
                    ...styles.toggleSwitch,
                    ...(isMobile ? styles.toggleSwitchMobile : {}),
                    ...(autoRefillMessages.enabled ? styles.toggleActive : {}),
                  }}
                  onClick={() =>
                    setAutoRefillMessages((prev) => ({
                      ...prev,
                      enabled: !prev.enabled,
                    }))
                  }
                >
                  <div
                    style={{
                      ...styles.toggleSlider,
                      ...(isMobile ? styles.toggleSliderMobile : {}),
                      transform: autoRefillMessages.enabled
                        ? "translateX(20px)"
                        : "translateX(0)",
                    }}
                  />
                </div>
              </div>
              {autoRefillMessages.enabled && (
                <div
                  style={{
                    padding: "16px",
                    backgroundColor: "#101a22",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <div style={{ marginBottom: "16px" }}>
                    <label
                      style={{
                        ...styles.settingsLabel,
                        display: "block",
                        marginBottom: "8px",
                      }}
                    >
                      When messages remaining fall below:
                    </label>
                    <input
                      type="number"
                      value={autoRefillMessages.thresholdMessages}
                      onChange={(e) =>
                        setAutoRefillMessages((prev) => ({
                          ...prev,
                          thresholdMessages: e.target.value,
                        }))
                      }
                      style={{
                        ...styles.titleInput,
                        width: "100%",
                        fontSize: "14px",
                        padding: "8px 12px",
                        backgroundColor: "#0b1117",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: "6px",
                        color: "#ffffff",
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: "16px" }}>
                    <label
                      style={{
                        ...styles.settingsLabel,
                        display: "block",
                        marginBottom: "8px",
                      }}
                    >
                      Automatically purchase:
                    </label>
                    <select
                      value={autoRefillMessages.packToPurchase.packName}
                      onChange={(e) => {
                        const selectedPack = MESSAGE_PACK_OPTIONS.find(
                          (p) => p.packName === e.target.value
                        );
                        setAutoRefillMessages((prev) => ({
                          ...prev,
                          packToPurchase: selectedPack,
                        }));
                      }}
                      style={{
                        ...styles.titleInput,
                        width: "100%",
                        fontSize: "14px",
                        padding: "8px 12px",
                        backgroundColor: "#0b1117",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: "6px",
                        color: "#ffffff",
                      }}
                    >
                      {MESSAGE_PACK_OPTIONS.map((pack) => (
                        <option key={pack.packName} value={pack.packName}>
                          {pack.packName} (${pack.price.toFixed(2)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      marginTop: "8px",
                    }}
                  >
                    This will use your Wallet balance if sufficient.
                    {platformCardInfo &&
                      ` Otherwise, your card on file (${platformCardInfo.type} ****${platformCardInfo.last4}) will be used.`}
                    {!platformCardInfo &&
                      ` Please ensure you have a card on file if wallet balance is low.`}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Message Packs */}
          <div ref={messagePacksRef} style={styles.settingsSection}>
            <h3 style={styles.sectionTitle}>Message Packs</h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {MESSAGE_PACK_OPTIONS.map((pack) => (
                <div
                  key={pack.packName}
                  style={{
                    ...styles.cardItem,
                    ...(isMobile ? styles.cardItemMobile : {}),
                  }}
                >
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "600" }}>
                      {pack.packName}
                    </div>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>
                      ${pack.price.toFixed(2)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleBuyPack(pack)}
                    style={{
                      ...styles.buyButton,
                      ...(isMobile ? styles.buyButtonMobile : {}),
                    }}
                    disabled={!platformCardInfo && walletBalance < pack.price}
                  >
                    Buy
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction History */}
          <div style={styles.settingsSection}>
            <h3 style={styles.sectionTitle}>Transaction History</h3>
            <div style={{ maxHeight: "200px", overflowY: "auto" }}>
              {transactionHistory.length > 0 ? (
                transactionHistory.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      ...styles.transactionItem,
                      ...(isMobile ? styles.transactionItemMobile : {}),
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "14px" }}>{item.description}</div>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>
                        {item.date}
                      </div>
                    </div>
                    <div
                      style={{ color: item.amount < 0 ? "#ef4444" : "#10b981" }}
                    >
                      {item.amount < 0 ? "-" : "+"}$
                      {Math.abs(item.amount).toFixed(2)}
                    </div>
                  </div>
                ))
              ) : (
                <p
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    textAlign: "center",
                    padding: "20px",
                  }}
                >
                  No AI Assistant transactions yet.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Purchase Confirmation Modal */}
      {showPurchaseModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Confirm Purchase</h3>
            <p style={styles.modalBody}>
              Purchase {showPurchaseModal.packName} for $
              {showPurchaseModal.price.toFixed(2)}?
            </p>
            {platformCardInfo && (
              <div
                style={{
                  padding: "8px 0",
                  borderTop: "1px solid #374151",
                  borderBottom: "1px solid #374151",
                  margin: "16px 0",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="platformCard"
                    checked={selectedPurchaseMethod === "platformCard"}
                    onChange={(e) => setSelectedPurchaseMethod(e.target.value)}
                    disabled={!platformCardInfo}
                    style={{ marginRight: "8px" }}
                  />
                  Charge to card: {platformCardInfo.type} ****
                  {platformCardInfo.last4}
                </label>
              </div>
            )}
            {walletBalance >= showPurchaseModal.price && (
              <div
                style={{
                  padding: "8px 0",
                  borderBottom: "1px solid #374151",
                  margin: "0 0 16px 0",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="wallet"
                    checked={selectedPurchaseMethod === "wallet"}
                    onChange={(e) => setSelectedPurchaseMethod(e.target.value)}
                    disabled={walletBalance < showPurchaseModal.price}
                    style={{ marginRight: "8px" }}
                  />
                  Use Wallet Balance (${walletBalance.toFixed(2)})
                </label>
              </div>
            )}
            <div style={styles.modalButtons}>
              <button
                style={{
                  ...styles.modalButton,
                  ...styles.modalSecondaryButton,
                }}
                onClick={() => setShowPurchaseModal(null)}
              >
                Cancel
              </button>
              <button
                style={{ ...styles.modalButton, ...styles.modalPrimaryButton }}
                onClick={() => {
                  handleConfirmPurchase(
                    showPurchaseModal,
                    selectedPurchaseMethod
                  );
                }}
                disabled={
                  (selectedPurchaseMethod === "platformCard" &&
                    !platformCardInfo) ||
                  (selectedPurchaseMethod === "wallet" &&
                    walletBalance < showPurchaseModal.price)
                }
              >
                Pay ${showPurchaseModal.price.toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 60%, 100% {
            opacity: 0.3;
          }
          30% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default AIChatInterface;
