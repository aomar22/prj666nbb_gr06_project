import { useMemo, useState } from "react";
import {SendHorizontal, Star} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";

const mockConversations = [
  {
    id: "c1",
    tutorName: "Tom Holland",
    roleLabel: "Certified Peer Tutor",
    rating: "4.9",
    reviews: "32 reviews",
    statusText: "Sending...",
    avatar: "https://ui-avatars.com/api/?name=Tom+Holland&background=random",
    messages: [
      {
        id: "m1",
        sender: "learner",
        text: "Hi! I’m looking for some help with my OOP course. I’m having a hard time understanding inheritance and polymorphism.",
      },
      {
        id: "m2",
        sender: "tutor",
        text: "Hey! No problem — OOP concepts can definitely be tricky at first. What language are you using in your course?",
      },
      {
        id: "m3",
        sender: "learner",
        text: "We’re learning in C++. I get how classes and objects work, but when it comes to inheritance and overriding functions, I get lost.",
      },
    ],
  },
  {
    id: "c2",
    tutorName: "Brad Pitt",
    roleLabel: "Certified Peer Tutor",
    rating: "4.9",
    reviews: "32 reviews",
    statusText: "Delivered",
    avatar: "https://ui-avatars.com/api/?name=Brad+Pitt&background=random",
    messages: [],
  },
  {
    id: "c3",
    tutorName: "Megan Fox",
    roleLabel: "Certified Peer Tutor",
    rating: "4.9",
    reviews: "32 reviews",
    statusText: "Delivered",
    avatar: "https://ui-avatars.com/api/?name=Megan+Fox&background=random",
    messages: [],
  },
  {
    id: "c4",
    tutorName: "Chris Evans",
    roleLabel: "Certified Peer Tutor",
    rating: "4.9",
    reviews: "32 reviews",
    statusText: "Sent",
    avatar: "https://ui-avatars.com/api/?name=Chris+Evans&background=random",
    messages: [],
  },
  {
    id: "c5",
    tutorName: "Chris Hemsworth",
    roleLabel: "Certified Peer Tutor",
    rating: "4.9",
    reviews: "32 reviews",
    statusText: "Read",
    avatar: "https://ui-avatars.com/api/?name=Chris+Hemsworth&background=random",
    messages: [],
  },
];

const learnerAvatar =
  "https://ui-avatars.com/api/?name=Learner&background=random";

function ConversationCard({ conversation, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full
        rounded-[24px]
        border
        px-4
        py-4
        text-left
        shadow-[0_4px_10px_rgba(0,0,0,0.12)]
        transition
        hover:-translate-y-[1px]
        ${selected ? "border-black bg-white" : "border-black/80 bg-white"}
      `}
    >
      <div className="flex items-start gap-4">
        <img
          src={conversation.avatar}
          alt={conversation.tutorName}
          className="
            h-14
            w-14
            rounded-full
            object-cover
          "
        />

        <div className="min-w-0 flex-1">
          <h3
            className="
              truncate
              font-mono
              text-[20px]
              font-bold
              text-black
            "
          >
            {conversation.tutorName}
          </h3>

          <div className="mt-1 flex items-end gap-2">
            <div
              className="
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
                font-mono
                text-[12px]
                text-black
              "
            >
              ({conversation.reviews})
            </span>
          </div>

          <p
            className="
              mt-1
              font-mono
              text-[14px]
              font-semibold
              text-black
            "
          >
            {conversation.roleLabel}
          </p>

          <p
            className="
              mt-1
              font-mono
              text-[12px]
              text-black/80
            "
          >
            {conversation.statusText}
          </p>
        </div>
      </div>
    </button>
  );
}

function MessageBubble({ message, avatar }) {
  const isTutor = message.sender === "tutor";

  return (
    <div
      className={`
        flex
        items-end
        gap-3
        ${isTutor ? "justify-start" : "justify-end"}
      `}
    >
      {isTutor && (
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
      )}

      <div
        className="
          max-w-[78%]
          rounded-[22px]
          bg-[#f3f3f3]
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
          {message.text}
        </p>
      </div>

      {!isTutor && (
        <img
          src={learnerAvatar}
          alt="Learner"
          className="
            h-12
            w-12
            rounded-full
            object-cover
          "
        />
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
          bg-[#f3f3f3]
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
  const [selectedConversationId, setSelectedConversationId] = useState(
    mockConversations[0].id
  );
  const [draftMessage, setDraftMessage] = useState("");

  const selectedConversation = useMemo(
    () =>
      mockConversations.find(
        (conversation) => conversation.id === selectedConversationId
      ) || mockConversations[0],
    [selectedConversationId]
  );

  const handleSend = () => {
    if (!draftMessage.trim()) return;
    setDraftMessage("");
  };

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
              xl:grid-cols-[320px_minmax(0,1fr)]
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
                {mockConversations.map((conversation) => (
                  <ConversationCard
                    key={conversation.id}
                    conversation={conversation}
                    selected={conversation.id === selectedConversationId}
                    onClick={() => setSelectedConversationId(conversation.id)}
                  />
                ))}
              </div>
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
                  alt={selectedConversation.tutorName}
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
                  {selectedConversation.tutorName}
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
                          avatar={selectedConversation.avatar}
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
                    "
                  />

                  <button
                    type="button"
                    onClick={handleSend}
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
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}