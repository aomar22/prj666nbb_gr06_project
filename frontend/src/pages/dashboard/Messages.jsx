import { useEffect, useMemo, useRef, useState } from "react";
import { SendHorizontal, Star } from "lucide-react";
import { useLocation } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Avatar from "../../components/ui/Avatar";
import {
  createChatClient,
  getDirectChatHistory,
  getDirectConversations,
  getGroupChatHistory,
  getUser,
  markDirectChatAsRead,
  markGroupChatAsRead,
  sendChatMessage,
} from "../../api";

function buildDirectConversationId(userId1, userId2) {
  const a = String(userId1 ?? "");
  const b = String(userId2 ?? "");

  return a.localeCompare(b) < 0 ? `${a}_${b}` : `${b}_${a}`;
}

function getInitials(name) {
  if (!name) return "U";

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function getRecipientId(conversation, currentUserRole) {
  if (conversation?.otherUserId) return conversation.otherUserId;

  const isTutor = currentUserRole === "TUTOR";

  return isTutor
    ? conversation?.participants?.learner?.id
    : conversation?.participants?.tutor?.id;
}

function formatConversationTime(sentAt) {
  if (!sentAt) return "";
  const date = new Date(sentAt);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getLastMessage(messages = []) {
  if (!Array.isArray(messages) || messages.length === 0) return null;
  return messages[messages.length - 1];
}

function getLastMessagePreview(messages = []) {
  const lastMessage = getLastMessage(messages);
  if (!lastMessage?.content) return "No messages yet.";

  const text = lastMessage.content.trim();
  if (text.length <= 45) return text;
  return `${text.slice(0, 45).trim()}...`;
}

function getPeerParticipant(conversation, currentUserRole) {
  const participants = conversation?.participants || {};
  const isTutor = currentUserRole === "TUTOR";
  const peer = isTutor ? participants.learner : participants.tutor;

  if (peer?.name || peer?.avatar) {
    return {
      name: peer?.name || "Unknown user",
      avatar: peer?.avatar || null,
      roleLabel:
        peer?.roleLabel || (isTutor ? "Learner" : "Certified Peer Tutor"),
    };
  }

  return {
    name: conversation?.tutorName || "Unknown user",
    avatar: conversation?.avatar || null,
    roleLabel:
      conversation?.roleLabel || (isTutor ? "Learner" : "Certified Peer Tutor"),
  };
}

function renderMessageContent(content) {
  if (!content) return null;

  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
  const parts = content.split(urlRegex);

  return parts.filter(Boolean).map((part, index) => {
    const isUrl = /^https?:\/\//i.test(part) || /^www\./i.test(part);

    if (!isUrl) {
      return <span key={`${part}-${index}`}>{part}</span>;
    }

    const href = part.startsWith("http") ? part : `https://${part}`;

    return (
      <a
        key={`${part}-${index}`}
        href={href}
        target="_blank"
        rel="noreferrer"
        className="break-words underline underline-offset-2"
      >
        {part}
      </a>
    );
  });
}

function buildConversationFromSelectedPeer(
  selectedPeer,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  currentUserRole
) {
  if (!selectedPeer?.id) return null;

  const isTutor = currentUserRole === "TUTOR";
  const conversationId = buildDirectConversationId(currentUserId, selectedPeer.id);

  return {
    id: conversationId,
    conversationType: "DIRECT",
    otherUserId: selectedPeer.id,
    participants: {
      tutor: isTutor
        ? {
            id: currentUserId,
            name: currentUserName,
            roleLabel: "Certified Peer Tutor",
            avatar: currentUserAvatar,
          }
        : {
            id: selectedPeer.id,
            name: selectedPeer.name || "Tutor",
            roleLabel: selectedPeer.roleLabel || "Certified Peer Tutor",
            avatar: selectedPeer.avatar || null,
          },
      learner: isTutor
        ? {
            id: selectedPeer.id,
            name: selectedPeer.name || "Learner",
            roleLabel: selectedPeer.roleLabel || "Learner",
            avatar: selectedPeer.avatar || null,
          }
        : {
            id: currentUserId,
            name: currentUserName,
            roleLabel: "Learner",
            avatar: currentUserAvatar,
          },
    },
    tutorName: isTutor ? currentUserName : selectedPeer.name || "Tutor",
    roleLabel: isTutor
      ? selectedPeer.roleLabel || "Learner"
      : selectedPeer.roleLabel || "Certified Peer Tutor",
    rating: selectedPeer.rating || "—",
    reviews: selectedPeer.reviews || "0 reviews",
    avatar: selectedPeer.avatar || null,
    slotId: selectedPeer?.slotId || null,
    messages: [],
  };
}

function ConversationCard({ conversation, selected, onClick }) {
  const lastMessage = getLastMessage(conversation.messages);
  const lastPreview = getLastMessagePreview(conversation.messages);
  const lastTime = formatConversationTime(lastMessage?.sentAt);
  const isTutorPeer = conversation.roleLabel === "Certified Peer Tutor";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full
        rounded-[20px]
        border-2
        bg-white
        px-3
        py-3
        text-left
        shadow-[0_4px_10px_rgba(0,0,0,0.12)]
        transition
        hover:-translate-y-[1px]
        ${
          selected
            ? "border-[#8D0103]"
            : "border-transparent hover:border-gray-200"
        }
      `}
    >
      <div className="flex items-start gap-4">
        <div
          className="
            flex
            w-[90px]
            shrink-0
            flex-col
            items-start
            font-bold
          "
        >
        
          <Avatar
            person={conversation}
            size={56}
            
          />

          {isTutorPeer && (
            <>
              <div
                className="
                  mt-2
                  flex
                  items-center
                  gap-1
                  font-mono
                  text-[16px]
                  font-bold
                  text-black
                "
              >
                <Star size={16} fill="currentColor" strokeWidth={1.75} />
                <span>{conversation.rating}</span>
              </div>

              <span
                className="
                  mt-[2px]
                  font-mono
                  text-[11px]
                  text-black
                "
              >
                (
                {typeof conversation.reviews === "number"
                  ? `${conversation.reviews} reviews`
                  : conversation.reviews}
                )
              </span>
            </>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div
            className="
              flex
              items-start
              justify-between
              gap-3
              font-bold
            "
          >
            <h3
              className="
                truncate
                font-mono
                text-[20px]
                font-bold
                text-black
              "
            >
              {conversation.name}
            </h3>

            <div className="flex shrink-0 items-center gap-2">
              <span
                className="
                  font-mono
                  text-[11px]
                  font-semibold
                  text-black/70
                "
              >
                {lastTime}
              </span>
            </div>
          </div>

          <p
            className="
              mt-1
              font-mono
              text-[15px]
              font-semibold
              text-black
            "
          >
            {conversation.roleLabel}
          </p>

          <p
            className="
              mt-1
              truncate
              font-mono
              text-[12px]
              font-semibold
              text-black/75
            "
          >
            {lastPreview}
          </p>
        </div>
      </div>
    </button>
  );
}

function MessageReadStatus({ message, isOwnMessage }) {
  if (!isOwnMessage) return null;

  return (
    <span
      className={`
        font-mono
        text-[11px]
        ${message.read ? "text-[#4A90D9]" : "text-black/40"}
      `}
    >
      {message.read ? "Read" : "Delivered"}
    </span>
  );
}

function MessageBubble({ message, currentUserId }) {
  const isPeerMessage = message.senderId !== currentUserId;
  const isOwnMessage = !isPeerMessage;

  return (
    <div
      className={`
        flex
        flex-col
        ${isPeerMessage ? "items-start" : "items-end"}
      `}
    >
      <div
        className={`
          flex
          items-end
          gap-3
          ${isPeerMessage ? "justify-start" : "justify-end"}
        `}
      >
        {isPeerMessage && (
          <div
            className="
              h-12
              w-12
              rounded-full
              bg-[#E8E0D8]
              flex
              items-center
              justify-center
              text-[#7A0000]
              font-mono
              font-bold
              text-[22px]
            "
          >
            {getInitials(message.senderName)}
          </div>
        )}

        <div
          className="
            max-w-[78%]
            rounded-[22px]
            bg-[#F9F9F9]
            px-5
            py-4
            shadow-sm
            sm:max-w-[70%]
          "
        >
          <p
            className="
              whitespace-pre-line
              font-mono
              text-[15px]
              font-semibold
              leading-8
              text-black
            "
          >
            {renderMessageContent(message.content)}
          </p>
        </div>

        {isOwnMessage && (
          <div className="h-12 w-12 rounded-full bg-[#E8E0D8] flex items-center justify-center text-[#7A0000] font-mono font-bold text-[22px]">
            {getInitials(message.senderName || "You")}
          </div>
        )}
      </div>

      {isOwnMessage && (
        <div
          className="
            mr-[60px]
            mt-1
            flex
            items-center
          "
        >
          <MessageReadStatus
            message={message}
            isOwnMessage={isOwnMessage}
          />
        </div>
      )}
    </div>
  );
}

export default function Messages() {
  const location = useLocation();
  const { pathname, state } = location;

  const stompClientRef = useRef(null);
  const conversationsRef = useRef([]);

  const currentUser = getUser();
  const userRole = (currentUser?.role || "").toUpperCase();

  const isLearnerRoute = pathname.startsWith("/dashboard/learner");
  const isTutorRoute =
    pathname.startsWith("/dashboard/tutor") ||
    pathname.startsWith("/dashboard/availability") ||
    pathname.startsWith("/dashboard/find-students");

  const currentUserRole = isLearnerRoute
    ? "LEARNER"
    : isTutorRoute
      ? "TUTOR"
      : userRole || "LEARNER";

  const currentUserId = String(currentUser?.id || "learner-1");

  const currentUserName =
    currentUser?.firstName && currentUser?.lastName
      ? `${currentUser.firstName} ${currentUser.lastName}`
      : currentUser?.firstName ||
        currentUser?.lastName ||
        currentUser?.email ||
        "You";

  const currentUserAvatar =
    currentUser?.avatar ||
    currentUser?.profileImageUrl ||
    currentUser?.profilePicture ||
    null;

  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [draftMessage, setDraftMessage] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [connectionError, setConnectionError] = useState("");
  const [chatReady, setChatReady] = useState(false);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  const conversationsWithPeer = useMemo(
    () =>
      conversations.map((conversation) => ({
        ...conversation,
        ...getPeerParticipant(conversation, currentUserRole),
      })),
    [conversations, currentUserRole]
  );

  const selectedConversation = useMemo(
    () =>
      conversationsWithPeer.find(
        (conversation) => conversation.id === selectedConversationId
      ) || null,
    [selectedConversationId, conversationsWithPeer]
  );

  useEffect(() => {
    async function loadConversations() {
      try {
        const data = await getDirectConversations();
        if (!Array.isArray(data) || data.length === 0) return;

        setConversations((prev) => {
          const existingIds = new Set(prev.map((c) => c.id));
          const toAdd = [];

          for (const item of data) {
            const conversationId = item.conversationId;
            if (!conversationId || existingIds.has(conversationId)) continue;

            toAdd.push({
              id: conversationId,
              conversationType: "DIRECT",
              otherUserId: item.otherUserId,
              participants: {},
              tutorName: item.otherUserName || "Unknown",
              roleLabel:
                currentUserRole === "TUTOR" ? "Learner" : "Certified Peer Tutor",
              rating: "—",
              reviews: "0 reviews",
              avatar: "",
              slotId: null,
              messages: item.lastMessage ? [item.lastMessage] : [],
            });
            existingIds.add(conversationId);
          }

          return toAdd.length ? [...toAdd, ...prev] : prev;
        });
      } catch (err) {
        console.error("Failed to load conversations", err);
      }
    }

    loadConversations();
  }, [currentUserId, currentUserRole]);

  useEffect(() => {
    const selectedPeer = state?.selectedTutor || state?.selectedLearner;
    if (!selectedPeer?.id) return;

    const newConversation = buildConversationFromSelectedPeer(
      { ...selectedPeer },
      currentUserId,
      currentUserName,
      currentUserAvatar,
      currentUserRole
    );

    if (!newConversation) return;

    setConversations((prev) => {
      const existingIndex = prev.findIndex(
        (conversation) => conversation.id === newConversation.id
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          otherUserId: updated[existingIndex].otherUserId || selectedPeer.id,
        };
        return updated;
      }

      return [newConversation, ...prev];
    });

    setSelectedConversationId(newConversation.id);
  }, [
    state,
    currentUserId,
    currentUserName,
    currentUserAvatar,
    currentUserRole,
  ]);

  useEffect(() => {
    const client = createChatClient({
      onConnect: () => {
        setChatReady(true);
        setConnectionError("");
      },
      onMessage: (incoming) => {
        if (!incoming?.conversationId || !incoming?.id) return;

        setConversations((prev) => {
          const existingIndex = prev.findIndex(
            (conversation) => conversation.id === incoming.conversationId
          );

          if (existingIndex >= 0) {
            const updated = [...prev];
            const existingConversation = updated[existingIndex];
            const existingMessages = Array.isArray(existingConversation.messages)
              ? existingConversation.messages
              : [];

            const alreadyExists = existingMessages.some(
              (message) => message.id === incoming.id
            );

            const updatedConversation = {
              ...existingConversation,
              otherUserId:
                existingConversation.otherUserId ||
                (incoming.senderId !== currentUserId
                  ? incoming.senderId
                  : existingConversation.otherUserId),
              messages: alreadyExists
                ? existingMessages
                : [...existingMessages, incoming],
            };

            updated.splice(existingIndex, 1);
            return [updatedConversation, ...updated];
          }

          const peerName =
            incoming.senderName ||
            (currentUserRole === "TUTOR" ? "Learner" : "Tutor");

          return [
            {
              id: incoming.conversationId,
              conversationType: "DIRECT",
              otherUserId:
                incoming.senderId !== currentUserId ? incoming.senderId : null,
              participants: {
                tutor:
                  currentUserRole === "TUTOR"
                    ? {
                        id: currentUserId,
                        name: currentUserName,
                        roleLabel: "Certified Peer Tutor",
                        avatar: currentUserAvatar,
                      }
                    : {
                        id: incoming.senderId,
                        name: peerName,
                        roleLabel: "Certified Peer Tutor",
                        avatar: null,
                      },
                learner:
                  currentUserRole === "TUTOR"
                    ? {
                        id: incoming.senderId,
                        name: peerName,
                        roleLabel: "Learner",
                        avatar: null,
                      }
                    : {
                        id: currentUserId,
                        name: currentUserName,
                        roleLabel: "Learner",
                        avatar: currentUserAvatar,
                      },
              },
              tutorName:
                currentUserRole === "TUTOR" ? currentUserName : peerName,
              roleLabel:
                currentUserRole === "TUTOR"
                  ? "Learner"
                  : "Certified Peer Tutor",
              rating: "—",
              reviews: "0 reviews",
              avatar: null,
              slotId: null,
              messages: [incoming],
            },
            ...prev,
          ];
        });
      },
      onError: () => {
        setChatReady(false);
        setConnectionError("Chat connection failed.");
      },
    });

    stompClientRef.current = client;

    return () => {
      setChatReady(false);

      try {
        client?.deactivate();
      } catch {
        // ignore
      }

      stompClientRef.current = null;
    };
  }, [currentUserId, currentUserName, currentUserAvatar, currentUserRole]);

  useEffect(() => {
    const loadHistory = async () => {
      if (!selectedConversationId) return;

      const activeConversation = conversationsRef.current.find(
        (conversation) => conversation.id === selectedConversationId
      );

      const otherUserId =
        activeConversation?.otherUserId ||
        getRecipientId(activeConversation, currentUserRole);

      if (!otherUserId) return;

      try {
        setLoadingHistory(true);

        const isGroup = Boolean(activeConversation?.slotId);
        const history = isGroup
          ? await getGroupChatHistory(activeConversation.slotId)
          : await getDirectChatHistory(otherUserId);

        const messages = Array.isArray(history) ? history : [];
        const peerMessage = messages.find((m) => m.senderId !== currentUserId);

        setConversations((prev) =>
          prev.map((conversation) =>
            conversation.id === selectedConversationId
              ? {
                  ...conversation,
                  otherUserId,
                  messages,
                  tutorName:
                    peerMessage?.senderName || conversation.tutorName,
                }
              : conversation
          )
        );

        if (isGroup) {
          await markGroupChatAsRead(activeConversation.slotId);
        } else {
          await markDirectChatAsRead(otherUserId);
        }
      } catch (error) {
        console.error("Failed to load chat history", error);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadHistory();
  }, [selectedConversationId, currentUserRole]);

  const handleSend = () => {
    const trimmed = draftMessage.trim();
    if (!trimmed || !selectedConversationId || !chatReady) return;

    const activeConversation = conversationsRef.current.find(
      (conversation) => conversation.id === selectedConversationId
    );

    const isGroup = Boolean(activeConversation?.slotId);
    const recipientId =
      activeConversation?.otherUserId ||
      getRecipientId(activeConversation, currentUserRole);

    if (!isGroup && !recipientId) return;

    const outgoingPayload = isGroup
      ? { slotId: activeConversation.slotId, content: trimmed }
      : { recipientId, content: trimmed };

    setDraftMessage("");

    try {
      sendChatMessage(stompClientRef.current, outgoingPayload);
    } catch (error) {
      console.error("Failed to send chat message", error);
      setConnectionError("Chat connection is not active.");
    }
  };

  const hasConversations = conversationsWithPeer.length > 0;
  const hasSelectedConversation = Boolean(selectedConversation);

  return (
    <DashboardLayout>
      <div
        className="
          min-h-screen
          bg-[#f4e9df]
          px-4
          py-4
          md:px-6
          lg:px-8
        "
      >
        <div
          className="
            mx-auto
            flex
            max-w-[1400px]
            flex-col
            gap-5
          "
        >
          <div
            className="
              grid
              min-h-[calc(100vh-170px)]
              grid-cols-1
              gap-4
              xl:grid-cols-[380px_minmax(0,1fr)]
            "
          >
            <section
              className="
                rounded-[28px]
                bg-[#ececec]
                px-4
                py-6
                shadow-sm
                md:px-5
              "
            >
              <h1
                className="
                  mb-8
                  text-center
                  font-mono
                  text-[34px]
                  font-bold
                  text-black
                "
              >
                Messages
              </h1>

              {hasConversations ? (
                <div
                  className="
                    flex
                    max-h-[calc(100vh-290px)]
                    flex-col
                    gap-3
                    overflow-y-auto
                    pr-1
                  "
                >
                  {conversationsWithPeer.map((conversation) => (
                    <ConversationCard
                      key={conversation.id}
                      conversation={conversation}
                      selected={conversation.id === selectedConversationId}
                      onClick={() => {
                        setSelectedConversationId(conversation.id);
                        setConnectionError("");
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div
                  className="
                    flex
                    min-h-[220px]
                    items-center
                    justify-center
                    px-4
                    text-center
                  "
                >
                  <p
                    className="
                      font-mono
                      text-[18px]
                      font-semibold
                      text-black/60
                    "
                  >
                    No conversations yet.
                  </p>
                </div>
              )}
            </section>

            <section
              className="
                flex
                min-h-[700px]
                flex-col
                rounded-[28px]
                bg-[#ececec]
                px-5
                py-5
                shadow-sm
                md:px-6
              "
            >
              {!hasConversations ? (
                <div
                  className="
                    flex
                    flex-1
                    items-center
                    justify-center
                    px-6
                    text-center
                  "
                >
                  <p
                    className="
                      font-mono
                      text-[20px]
                      font-semibold
                      text-black/60
                    "
                  >
                    No messages yet.
                    <br />
                    Start a conversation to begin chatting.
                  </p>
                </div>
              ) : !hasSelectedConversation ? (
                <div
                  className="
                    flex
                    flex-1
                    items-center
                    justify-center
                    px-6
                    text-center
                  "
                >
                  <p
                    className="
                      font-mono
                      text-[20px]
                      font-semibold
                      text-black/60
                    "
                  >
                    Select a conversation to open its thread.
                  </p>
                </div>
              ) : (
                <>
                  <header
                    className="
                      flex
                      items-center
                      gap-4
                      pb-4
                    "
                  >
                    {/* <div
                      className="
                        h-14
                        w-14
                        rounded-full
                        items-center
                        justify-center
                        bg-[#E8E0D8]
                        text-[#7A0000]
                        font-mono
                        font-bold
                      "
                    > */}
                      <Avatar
                        person={selectedConversation}
                        size={56}
                        
                      />
                      {/* <div
                        className="h-full w-full rounded-full
                                   flex items-center justify-center
                                   bg-[#E25555] font-mono font-extrabold
                                   text-white text-[22px]"
                      >
                        {getInitials(selectedConversation.name)}
                      </div> */}
                     {/* </div> */}

                    <div className="min-w-0 flex-1">
                      <h2
                        className="
                          font-mono
                          text-[22px]
                          font-bold
                          text-black
                          md:text-[28px]
                        "
                      >
                        {selectedConversation.name}
                      </h2>

                      <p className="font-mono text-[13px] font-semibold text-black/60">
                        {chatReady ? "Connected" : "Connecting..."}
                      </p>
                    </div>
                  </header>

                  {connectionError && (
                    <div className="mb-3 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 font-mono text-[14px] font-semibold text-red-700">
                      {connectionError}
                    </div>
                  )}

                  <div
                    className="
                      flex
                      flex-1
                      flex-col
                      justify-between
                      pt-4
                    "
                  >
                    <div
                      className="
                        flex
                        flex-1
                        flex-col
                        gap-7
                        overflow-y-auto
                        pr-1
                      "
                    >
                      {loadingHistory ? (
                        <div
                          className="
                            flex
                            flex-1
                            items-center
                            justify-center
                            py-16
                          "
                        >
                          <p
                            className="
                              text-center
                              font-mono
                              text-[18px]
                              font-semibold
                              text-black/60
                            "
                          >
                            Loading messages...
                          </p>
                        </div>
                      ) : selectedConversation.messages.length > 0 ? (
                        selectedConversation.messages.map((message) => (
                          <MessageBubble
                            key={message.id}
                            message={message}
                            currentUserId={currentUserId}
                          />
                        ))
                      ) : (
                        <div
                          className="
                            flex
                            flex-1
                            items-center
                            justify-center
                            py-16
                          "
                        >
                          <p
                            className="
                              text-center
                              font-mono
                              text-[18px]
                              font-semibold
                              text-black/60
                            "
                          >
                            No messages yet.
                          </p>
                        </div>
                      )}
                    </div>

                    <div
                      className="
                        mt-6
                        flex
                        items-center
                        gap-3
                      "
                    >
                      <input
                        type="text"
                        value={draftMessage}
                        onChange={(e) => setDraftMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSend();
                        }}
                        disabled={!hasSelectedConversation || !chatReady}
                        placeholder={
                          chatReady ? "Type a message..." : "Connecting to chat..."
                        }
                        className="
                          h-[52px]
                          flex-1
                          rounded-full
                          border
                          border-black
                          bg-white
                          px-6
                          font-sans
                          text-[15px]
                          text-black
                          outline-none
                          shadow-[0_4px_8px_rgba(0,0,0,0.12)]
                          disabled:cursor-not-allowed
                          disabled:opacity-60
                        "
                      />

                      <button
                        type="button"
                        onClick={handleSend}
                        disabled={!hasSelectedConversation || !chatReady}
                        className="
                          flex
                          h-[52px]
                          w-[52px]
                          items-center
                          justify-center
                          rounded-full
                          border
                          border-black
                          bg-white
                          text-black
                          shadow-[0_4px_8px_rgba(0,0,0,0.12)]
                          transition
                          hover:scale-[1.02]
                          disabled:cursor-not-allowed
                          disabled:opacity-60
                        "
                        aria-label="Send message"
                      >
                        <SendHorizontal
                          size={24}
                          fill="currentColor"
                          strokeWidth={1.75}
                        />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}