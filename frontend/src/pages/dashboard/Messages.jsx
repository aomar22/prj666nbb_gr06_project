import { useMemo, useState } from "react";
import { SendHorizontal, Star } from "lucide-react";
import { useLocation } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getUser } from "../../api";

function getRecipientId(conversation, currentUserRole) {
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
      avatar: peer?.avatar ||
        "https://ui-avatars.com/api/?name=Unknown+User&background=ddd&color=666",
      roleLabel:
        peer?.roleLabel || (isTutor ? "Learner" : "Certified Peer Tutor"),
    };
  }

  return {
    name: conversation?.tutorName || "Unknown user",
    avatar:
      conversation?.avatar ||
      "https://ui-avatars.com/api/?name=Unknown+User&background=ddd&color=666",
    roleLabel:
      conversation?.roleLabel || (isTutor ? "Learner" : "Certified Peer Tutor"),
  };
}
function ConversationCard({ conversation, selected, onClick }) {
  const lastMessage = getLastMessage(conversation.messages);
  const lastPreview = getLastMessagePreview(conversation.messages);
  const lastTime = formatConversationTime(lastMessage?.sentAt);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full
        rounded-[20px]
        p-4
        border-2
        px-3
        py-3
        text-left
        shadow-[0_4px_10px_rgba(0,0,0,0.12)]
        transition
        hover:-translate-y-[1px]
        ${selected 
           ? "border-[#8D0103] bg-white"
            : "border-transparent hover:border-gray-200 bg-white"}
      `}
    >
      <div className="flex items-start gap-4">
        {/* Left column: avatar + rating */}
        <div
          className="
            flex
            w-[90px]
            font-bold
            shrink-0
            flex-col
            items-start
          "
        >
          <img
            src={conversation.avatar}
            alt={conversation.name}
            className="
              h-14
              w-14
              rounded-full
              object-cover
            "
          />

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
            ({conversation.reviews})
          </span>
        </div>

        {/* Right column: name + time + role + status */}
        <div className="min-w-0 flex-1">
          <div
            className="
              flex
              items-start
              justify-between
              font-bold
              gap-3
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

            <span
              className="
                shrink-0
                font-mono
                text-[11px]
                font-semibold
                text-black/70
              "
            >
              {lastTime}
            </span>
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

function MessageBubble({
  message,
  peerAvatar,
  currentUserId,
  currentUserAvatar,
}) {
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
          <img
            src={peerAvatar}
            alt="Peer"
            className="
              h-12
              w-12
              rounded-full
              object-cover
            "
          />
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
            {message.content}
          </p>
        </div>

        {isOwnMessage && (
          <img
            src={currentUserAvatar}
            alt="You"
            className="
              h-12
              w-12
              rounded-full
              object-cover
            "
          />
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

function TypingIndicator({ avatar }) {
  return (
    <div
      className="
        flex
        items-end
        gap-3
      "
    >
      <img
        src={avatar}
        alt="Tutor"
        className="
          h-12
          w-12
          rounded-full
          object-cover
        "
      />

      <div
        className="
          flex
          h-11
          items-center
          rounded-full
          bg-[#F9F9F9]
          px-4
          shadow-sm
        "
      >
        <span
          className="
            font-mono
            text-[18px]
            leading-none
            text-[#78b7c8]
          "
        >
          ...
        </span>
      </div>
    </div>
  );
}

export default function Messages() {
  const { pathname } = useLocation();
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

  const currentUserId = currentUser?.id || "learner-1";

  const currentUserName =
    currentUser?.firstName && currentUser?.lastName
      ? `${currentUser.firstName} ${currentUser.lastName}`
      : currentUser?.firstName ||
        currentUser?.lastName ||
        currentUser?.email ||
        "You";

  const currentUserAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    currentUserName
  )}&background=ddd&color=666&size=100`;


  // const initialConversations = useMemo(
  //   () => [
  //     {
  //       id: "c1",
  //       participants: {
  //         tutor: {
  //           id: "tutor-1",
  //           name: "Tom Holland",
  //           roleLabel: "Certified Peer Tutor",
  //           avatar:
  //             "https://ui-avatars.com/api/?name=Tom+Holland&background=random",
  //         },
  //         learner: {
  //           id: "learner-11",
  //           name: "Sarah Parker",
  //           roleLabel: "Learner",
  //           avatar:
  //             "https://ui-avatars.com/api/?name=Sarah+Parker&background=random",
  //         },
  //       },
  //       tutorName: "Tom Holland",
  //       roleLabel: "Certified Peer Tutor",
  //       rating: "4.9",
  //       reviews: "32 reviews",
  //       avatar:
  //         "https://ui-avatars.com/api/?name=Tom+Holland&background=random",
  //       messages: [
  //         {
  //           id: "m1",
  //           conversationId: "c1",
  //           senderId: currentUserId,
  //           senderName: currentUserName,
  //           content:
  //             "Hi! I’m looking for some help with my OOP course. I’m having a hard time understanding inheritance and polymorphism.",
  //           sentAt: new Date().toISOString(),
  //           read: true,
  //         },
  //         {
  //           id: "m2",
  //           conversationId: "c1",
  //           senderId: "tutor-1",
  //           senderName: "Tom Holland",
  //           content:
  //             "Hey! No problem — OOP concepts can definitely be tricky at first. What language are you using in your course?",
  //           sentAt: new Date().toISOString(),
  //           read: true,
  //         },
  //         {
  //           id: "m3",
  //           conversationId: "c1",
  //           senderId: currentUserId,
  //           senderName: currentUserName,
  //           content:
  //             "We’re learning in C++. I get how classes and objects work, but when it comes to inheritance and overriding functions, I get lost.",
  //           sentAt: new Date().toISOString(),
  //           read: true,
  //         },
  //       ],
  //     },
  //     {
  //       id: "c2",
  //       participants: {
  //         tutor: {
  //           id: "tutor-2",
  //           name: "Brad Pitt",
  //           roleLabel: "Certified Peer Tutor",
  //           avatar:
  //             "https://ui-avatars.com/api/?name=Brad+Pitt&background=random",
  //         },
  //         learner: {
  //           id: "learner-12",
  //           name: "Noah Martinez",
  //           roleLabel: "Learner",
  //           avatar:
  //             "https://ui-avatars.com/api/?name=Noah+Martinez&background=random",
  //         },
  //       },
  //       tutorName: "Brad Pitt",
  //       roleLabel: "Certified Peer Tutor",
  //       rating: "4.9",
  //       reviews: "32 reviews",
  //       avatar:
  //         "https://ui-avatars.com/api/?name=Brad+Pitt&background=random",
  //       messages: [],
  //     },
  //     {
  //       id: "c3",
  //       participants: {
  //         tutor: {
  //           id: "tutor-3",
  //           name: "Megan Fox",
  //           roleLabel: "Certified Peer Tutor",
  //           avatar:
  //             "https://ui-avatars.com/api/?name=Megan+Fox&background=random",
  //         },
  //         learner: {
  //           id: "learner-13",
  //           name: "Ava Johnson",
  //           roleLabel: "Learner",
  //           avatar:
  //             "https://ui-avatars.com/api/?name=Ava+Johnson&background=random",
  //         },
  //       },
  //       tutorName: "Megan Fox",
  //       roleLabel: "Certified Peer Tutor",
  //       rating: "4.9",
  //       reviews: "32 reviews",
  //       avatar:
  //         "https://ui-avatars.com/api/?name=Megan+Fox&background=random",
  //       messages: [],
  //     },
  //     {
  //       id: "c4",
  //       participants: {
  //         tutor: {
  //           id: "tutor-4",
  //           name: "Chris Evans",
  //           roleLabel: "Certified Peer Tutor",
  //           avatar:
  //             "https://ui-avatars.com/api/?name=Chris+Evans&background=random",
  //         },
  //         learner: {
  //           id: "learner-14",
  //           name: "Liam Kim",
  //           roleLabel: "Learner",
  //           avatar:
  //             "https://ui-avatars.com/api/?name=Liam+Kim&background=random",
  //         },
  //       },
  //       tutorName: "Chris Evans",
  //       roleLabel: "Certified Peer Tutor",
  //       rating: "4.9",
  //       reviews: "32 reviews",
  //       avatar:
  //         "https://ui-avatars.com/api/?name=Chris+Evans&background=random",
  //       messages: [],
  //     },
  //     {
  //       id: "c5",
  //       participants: {
  //         tutor: {
  //           id: "tutor-5",
  //           name: "Chris Hemsworth",
  //           roleLabel: "Certified Peer Tutor",
  //           avatar:
  //             "https://ui-avatars.com/api/?name=Chris+Hemsworth&background=random",
  //         },
  //         learner: {
  //           id: "learner-15",
  //           name: "Emma Davis",
  //           roleLabel: "Learner",
  //           avatar:
  //             "https://ui-avatars.com/api/?name=Emma+Davis&background=random",
  //         },
  //       },
  //       tutorName: "Chris Hemsworth",
  //       roleLabel: "Certified Peer Tutor",
  //       rating: "4.9",
  //       reviews: "32 reviews",
  //       avatar:
  //         "https://ui-avatars.com/api/?name=Chris+Hemsworth&background=random",
  //       messages: [
  //         {
  //           id: "m4",
  //           conversationId: "c5",
  //           senderId: currentUserId,
  //           senderName: currentUserName,
  //           content: "Hi Chris",
  //           sentAt: new Date().toISOString(),
  //           read: true,
  //         },
  //       ],
  //     },
  //   ],
  //   [currentUserId, currentUserName]
  // );
//for frontend testing/demo purposes
 // const [conversations, setConversations] = useState(initialConversations);
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [draftMessage, setDraftMessage] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [conversationsError, setConversationsError] = useState("");

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

  const handleSend = () => {
    const trimmed = draftMessage.trim();
    if (!trimmed || !selectedConversationId) return;

    const outgoingPayload = {
      recipientId: getRecipientId(selectedConversation, currentUserRole),
      slotId: selectedConversation?.slotId || null,
      content: trimmed,
    };

    const newMessage = {
      id: Date.now().toString(),
      conversationId: selectedConversationId,
      senderId: currentUserId,
      senderName: currentUserName,
      content: trimmed,
      sentAt: new Date().toISOString(),
      read: false,
    };

    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === selectedConversationId
          ? {
              ...conversation,
              messages: [...conversation.messages, newMessage],
            }
          : conversation
      )
    );

    setDraftMessage("");

    sendMessagePlaceholder(outgoingPayload);
  };

  function sendMessagePlaceholder(payload) {
    console.log("ChatMessageRequest payload:", payload);
  }
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
                      onClick={() => setSelectedConversationId(conversation.id)}
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
                    <br/>
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
                    <img
                      src={selectedConversation.avatar}
                      alt={selectedConversation.name}
                      className="
                        h-14
                        w-14
                        rounded-full
                        object-cover
                      "
                    />

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
                  </header>

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
                        flex-col
                        gap-7
                        overflow-y-auto
                        pr-1
                      "
                    >
                      {selectedConversation.messages.length > 0 ? (
                        <>
                          {selectedConversation.messages.map((message) => (
                            <MessageBubble
                              key={message.id}
                              message={message}
                              peerAvatar={selectedConversation.avatar}
                              currentUserId={currentUserId}
                              currentUserAvatar={currentUserAvatar}
                            />
                          ))}

                          <TypingIndicator avatar={selectedConversation.avatar} />
                        </>
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
                        disabled={!hasSelectedConversation}
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
                        disabled={!hasSelectedConversation}
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