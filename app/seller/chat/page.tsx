"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, Suspense } from "react";
import { Send, User, ChevronLeft, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Message, Profile } from "@/types";
import toast from "react-hot-toast";
import Link from "next/link";

function SellerChatContent() {
  const searchParams = useSearchParams();
  const buyerId = searchParams.get("buyerId");
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [buyer, setBuyer] = useState<Profile | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUser(user);

      if (buyerId) {
        // Fetch buyer profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", buyerId)
          .single();
        setBuyer(profile);

        // Fetch messages
        const { data: msgs } = await supabase
          .from("messages")
          .select("*")
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${buyerId}),and(sender_id.eq.${buyerId},receiver_id.eq.${user.id})`)
          .order("created_at", { ascending: true });
        
        setMessages(msgs || []);
      }

      // Fetch all conversations for this seller
      const { data: receivedMessages } = await supabase
        .from("messages")
        .select("sender_id, sender:profiles!sender_id(*)")
        .eq("receiver_id", user.id);

      const { data: sentMessages } = await supabase
        .from("messages")
        .select("receiver_id, receiver:profiles!receiver_id(*)")
        .eq("sender_id", user.id);

      const convsMap = new Map();
      receivedMessages?.forEach(m => {
        if (m.sender) convsMap.set(m.sender_id, m.sender);
      });
      sentMessages?.forEach(m => {
        if (m.receiver) convsMap.set(m.receiver_id, m.receiver);
      });
      
      setConversations(Array.from(convsMap.values()));
      setLoading(false);
    };

    init();
  }, [buyerId]);

  useEffect(() => {
    if (!currentUser || !buyerId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`chat:${currentUser.id}:${buyerId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${currentUser.id}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          if (newMsg.sender_id === buyerId) {
            setMessages((prev) => [...prev, newMsg]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, buyerId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !buyerId) return;

    const supabase = createClient();
    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender_id: currentUser.id,
        receiver_id: buyerId,
        content: newMessage.trim(),
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to send message");
    } else {
      setMessages((prev) => [...prev, data]);
      setNewMessage("");
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Loading conversations...</div>;
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar - Conversation List */}
      <div className={`w-full md:w-80 border-r border-stone-100 flex flex-col ${buyerId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-stone-100">
          <h1 className="font-display text-2xl text-stone-900 font-light">Messages</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-10 text-center text-stone-400 text-sm">
              No conversations found.
            </div>
          ) : (
            conversations.map((conv) => (
              <Link 
                key={conv.id} 
                href={`/seller/chat?buyerId=${conv.id}`}
                className={`p-4 flex items-center gap-3 hover:bg-stone-50 transition-colors border-b border-stone-50 ${buyerId === conv.id ? 'bg-stone-50' : ''}`}
              >
                <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-stone-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-800 truncate">{conv.full_name}</p>
                  <p className="text-xs text-stone-400 truncate">{conv.role === 'seller' ? 'Seller' : 'Buyer'}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col ${!buyerId ? 'hidden md:flex items-center justify-center bg-stone-50' : 'flex'}`}>
        {buyerId ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-stone-100 flex items-center gap-3 bg-white">
              <Link href="/seller/chat" className="md:hidden p-2 -ml-2 text-stone-500">
                <ChevronLeft className="w-6 h-6" />
              </Link>
              <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center overflow-hidden">
                {buyer?.avatar_url ? (
                  <img src={buyer.avatar_url} alt={buyer.full_name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-stone-500" />
                )}
              </div>
              <div>
                <h2 className="font-medium text-stone-800">{buyer?.full_name}</h2>
                <p className="text-xs text-green-600">Online</p>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-4 bg-stone-50/30">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_id === currentUser?.id ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      msg.sender_id === currentUser?.id
                        ? "bg-stone-900 text-ivory-50 rounded-br-sm"
                        : "bg-white border border-stone-200 text-stone-800 rounded-bl-sm"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <span className="text-[10px] opacity-50 block mt-1">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-stone-100">
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your response..."
                  className="flex-1 bg-stone-50 border border-stone-200 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-stone-400"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-stone-900 text-white rounded-full p-3 hover:bg-stone-800 disabled:opacity-50 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <MessageCircle className="w-8 h-8 text-stone-300" />
            </div>
            <h2 className="text-xl font-display text-stone-800 font-light">Select a conversation</h2>
            <p className="text-stone-400 text-sm mt-2">Choose a buyer from the list to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SellerChatPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <SellerChatContent />
    </Suspense>
  );
}
