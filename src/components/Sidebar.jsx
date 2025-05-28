import React from "react";
import {
  Search,
  Plus,
  Settings,
  MoreVertical,
  Edit2,
  Pin,
  Trash2,
  Bot,
  MessageSquare,
  X,
} from "lucide-react";

const Sidebar = ({
  styles,
  searchQuery,
  setSearchQuery,
  chats,
  activeChat,
  setActiveChat,
  showChatMenu,
  setShowChatMenu,
  setShowSettings,
  showSettings,
  handleDeleteChat,
  handleRenameChat,
  isMobile = false,
  showMobileSidebar = false,
  setShowMobileSidebar,
}) => {
  return (
    <div
      className="sidebar"
      style={{
        ...styles.sidebar,
        ...(isMobile ? styles.sidebarMobile : {}),
        ...(isMobile && showMobileSidebar ? styles.sidebarMobileOpen : {}),
      }}
    >
      {/* Mobile Close Button */}
      {isMobile && (
        <button
          style={{
            ...styles.mobileCloseButton,
            ...styles.mobileCloseButtonVisible,
          }}
          onClick={() => setShowMobileSidebar(false)}
        >
          <X size={20} />
        </button>
      )}

      <div
        style={{
          ...styles.sidebarHeader,
          ...(isMobile ? styles.sidebarHeaderMobile : {}),
        }}
      >
        <div
          style={{
            ...styles.logoSection,
            ...(isMobile ? styles.logoSectionMobile : {}),
          }}
        >
          <div
            style={{
              ...styles.logo,
              ...(isMobile ? styles.logoMobile : {}),
            }}
          >
            <Bot size={isMobile ? 22 : 24} color="#f0b86c" />
            <span>AI Assistant</span>
          </div>
          {/* Settings button - only show on desktop or move to bottom on mobile */}
          {!isMobile && (
            <button
              style={{
                ...styles.settingsButton,
                ...(isMobile ? styles.settingsButtonMobile : {}),
              }}
              onClick={() => setShowSettings(!showSettings)}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#101a22")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <Settings size={18} />
            </button>
          )}
        </div>

        <button
          style={{
            ...styles.newChatButton,
            ...(isMobile ? styles.newChatButtonMobile : {}),
          }}
          onClick={() => {
            setActiveChat(null);
            if (isMobile) {
              setShowMobileSidebar(false);
            }
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#dc9a08";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#f0b86c";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <Plus size={16} />
          New Chat
        </button>
      </div>

      <div
        style={{
          ...styles.searchContainer,
          ...(isMobile ? styles.searchContainerMobile : {}),
        }}
      >
        <Search
          size={16}
          style={{
            ...styles.searchIcon,
            ...(isMobile ? styles.searchIconMobile : {}),
          }}
        />
        <input
          type="text"
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            ...styles.searchInput,
            ...(isMobile ? styles.searchInputMobile : {}),
          }}
          onFocus={(e) =>
            (e.target.style.borderColor = "rgba(240, 184, 108, 0.5)")
          }
          onBlur={(e) =>
            (e.target.style.borderColor = "rgba(255, 255, 255, 0.1)")
          }
        />
      </div>

      <div
        style={{
          ...styles.chatList,
          ...(isMobile ? styles.chatListMobile : {}),
          // Add padding bottom on mobile to make room for settings button
          ...(isMobile ? { paddingBottom: "80px" } : {}),
        }}
      >
        {chats.length === 0 ? (
          <div style={styles.emptyStateSidebar}>
            <MessageSquare
              size={24}
              style={{ opacity: 0.5, marginBottom: "8px" }}
            />
            No recent chats.
            <br />
            Start a new conversation!
          </div>
        ) : (
          chats
            .filter((chat) =>
              chat.title.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((chat) => (
              <div
                key={chat.id}
                style={{
                  ...styles.chatItem,
                  ...(isMobile ? styles.chatItemMobile : {}),
                  ...(activeChat === chat.id ? styles.chatItemActive : {}),
                }}
                onClick={() => {
                  setActiveChat(chat.id);
                  if (isMobile) {
                    setShowMobileSidebar(false);
                  }
                }}
                onMouseEnter={(e) => {
                  if (activeChat !== chat.id) {
                    e.currentTarget.style.backgroundColor = "#101a22";
                  }
                  e.currentTarget.querySelector(".menu-button").style.opacity =
                    "1";
                }}
                onMouseLeave={(e) => {
                  if (activeChat !== chat.id) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                  if (!isMobile) {
                    e.currentTarget.querySelector(
                      ".menu-button"
                    ).style.opacity = "0";
                  }
                }}
              >
                <div style={styles.chatInfo}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "2px",
                    }}
                  >
                    <div
                      style={{
                        ...styles.chatTitle,
                        ...(isMobile ? styles.chatTitleMobile : {}),
                      }}
                    >
                      {chat.title}
                    </div>
                    <div
                      style={{
                        fontSize: isMobile ? "12px" : "11px",
                        color: "#6b7280",
                      }}
                    >
                      {chat.lastActive}
                    </div>
                  </div>
                  <div
                    style={{
                      ...styles.chatPreview,
                      ...(isMobile ? styles.chatPreviewMobile : {}),
                    }}
                  >
                    {chat.preview}
                  </div>
                </div>
                <div style={styles.chatMenu}>
                  <button
                    className="menu-button"
                    style={{
                      ...styles.menuButton,
                      ...(isMobile ? styles.menuButtonMobile : {}),
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowChatMenu(
                        showChatMenu === chat.id ? null : chat.id
                      );
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#101a22")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <MoreVertical size={14} />
                  </button>
                  {showChatMenu === chat.id && (
                    <div
                      style={{
                        ...styles.menuDropdown,
                        ...(isMobile ? styles.menuDropdownMobile : {}),
                      }}
                    >
                      <div
                        style={{
                          ...styles.menuItem,
                          ...(isMobile ? styles.menuItemMobile : {}),
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#101a22")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "transparent")
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRenameChat(chat.id);
                        }}
                      >
                        <Edit2 size={14} />
                        Rename
                      </div>
                      <div
                        style={{
                          ...styles.menuItem,
                          ...(isMobile ? styles.menuItemMobile : {}),
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#101a22")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "transparent")
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChat(chat.id);
                        }}
                      >
                        <Trash2 size={14} />
                        Delete
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
        )}
      </div>

      {/* Mobile Settings Button - Fixed at bottom right */}
      {isMobile && (
        <button
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            zIndex: 1003,
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            backgroundColor: "#f59e0b",
            border: "none",
            color: "#0f172a",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(245, 158, 11, 0.4)",
            transition: "all 0.2s",
          }}
          onClick={() => {
            setShowSettings(!showSettings);
            setShowMobileSidebar(false);
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#dc9a08";
            e.currentTarget.style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#f59e0b";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <Settings size={24} />
        </button>
      )}
    </div>
  );
};

export default Sidebar;
