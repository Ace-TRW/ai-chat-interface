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
}) => {
  return (
    <div style={styles.sidebar}>
      <div style={styles.sidebarHeader}>
        <div style={styles.logoSection}>
          <div style={styles.logo}>
            <Bot size={24} color="#f0b86c" />
            <span>AI Assistant</span>
          </div>
          <button
            style={styles.settingsButton}
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
        </div>

        <button
          style={styles.newChatButton}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.02)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <Plus size={16} />
          New Chat
        </button>
      </div>

      <div style={styles.searchContainer}>
        <Search size={16} style={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
          onFocus={(e) =>
            (e.target.style.borderColor = "rgba(240, 184, 108, 0.5)")
          }
          onBlur={(e) =>
            (e.target.style.borderColor = "rgba(255, 255, 255, 0.1)")
          }
        />
      </div>

      <div style={styles.chatList}>
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
                  ...(activeChat === chat.id ? styles.chatItemActive : {}),
                }}
                onClick={() => setActiveChat(chat.id)}
                onMouseEnter={(e) => {
                  if (activeChat !== chat.id) {
                    e.currentTarget.style.backgroundColor = "#101a22";
                  }
                  const menuBtn =
                    e.currentTarget.querySelector("[data-menu-btn]");
                  if (menuBtn) menuBtn.style.opacity = "1";
                }}
                onMouseLeave={(e) => {
                  if (activeChat !== chat.id) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                  const menuBtn =
                    e.currentTarget.querySelector("[data-menu-btn]");
                  if (menuBtn && showChatMenu !== chat.id)
                    menuBtn.style.opacity = "0";
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
                    <div style={styles.chatTitle}>{chat.title}</div>
                    <div style={{ fontSize: "11px", color: "#6b7280" }}>
                      {chat.lastActive}
                    </div>
                  </div>
                  <div style={styles.chatPreview}>{chat.preview}</div>
                </div>
                <div style={styles.chatMenu}>
                  <button
                    data-menu-btn
                    style={styles.menuButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowChatMenu(
                        showChatMenu === chat.id ? null : chat.id
                      );
                    }}
                  >
                    <MoreVertical size={16} />
                  </button>
                  {showChatMenu === chat.id && (
                    <div style={styles.menuDropdown}>
                      <div
                        style={styles.menuItem}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "rgba(255, 255, 255, 0.1)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "transparent")
                        }
                        onClick={() => handleRenameChat(chat.id)}
                      >
                        <Edit2 size={14} />
                        Rename
                      </div>
                      <div
                        style={styles.menuItem}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "rgba(255, 255, 255, 0.1)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "transparent")
                        }
                        onClick={() => {
                          setShowChatMenu(null);
                        }}
                      >
                        <Pin size={14} />
                        Pin Chat
                      </div>
                      <div
                        style={styles.menuItem}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "rgba(239, 68, 68, 0.1)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "transparent")
                        }
                        onClick={() => handleDeleteChat(chat.id)}
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

      <div
        style={{
          padding: "12px 16px",
          fontSize: "11px",
          color: "#6b7280",
          textAlign: "center",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div style={{ marginBottom: "4px" }}>
          AI Responses May Contain Inaccuracies.
        </div>
        <div>Verify Important Information</div>
      </div>
    </div>
  );
};

export default Sidebar;
