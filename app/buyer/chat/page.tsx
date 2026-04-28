"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Send, User, ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Message, Profile } from "@/types";
import toast from "react-hot-toast";
import Link from "next/link";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const sellerId = searchParams.get("sellerId");
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [seller, setSeller] = useState<Profile | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to chat");
        return;
      }
      setCurrentUser(user);

      if (sellerId) {
        // Fetch seller profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", sellerId)
          .single();
        setSeller(profile);

        // Fetch messages
        const { data: msgs } = await supabase
          .from("messages")
          .select("*")
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${sellerId}),and(sender_id.eq.${sellerId},receiver_id.eq.${user.id})`)
          .order("created_at", { ascending: true });
        
        setMessages(msgs || []);
      } else {
        // Fetch conversations list
        // This is a bit complex with current schema, but let's try to get unique senders/receivers
        const { data: sentMessages } = await supabase
          .from("messages")
          .select("receiver_id, receiver:profiles!receiver_id(*)")
          .eq("sender_id", user.id);
        
        const { data: receivedMessages } = await supabase
          .from("messages")
          .select("sender_id, sender:profiles!sender_id(*)")
          .eq("receiver_id", user.id);

        const convsMap = new Map();
        sentMessages?.forEach(m => {
          if (m.receiver) convsMap.set(m.receiver_id, m.receiver);
        });
        receivedMessages?.forEach(m => {
          if (m.sender) convsMap.set(m.sender_id, m.sender);
        });
        
        setConversations(Array.from(convsMap.values()));
      }
      setLoading(false);
    };

    init();
  }, [sellerId]);

  useEffect(() => {
    if (!currentUser || !sellerId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`chat:${currentUser.id}:${sellerId}`)
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
          if (newMsg.sender_id === sellerId) {
            setMessages((prev) => [...prev, newMsg]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, sellerId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !sellerId) return;

    const supabase = createClient();
    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender_id: currentUser.id,
        receiver_id: sellerId,
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
    return <div className="pt-24 text-center">Loading chat...</div>;
  }

  if (!sellerId && conversations.length > 0) {
    return (
      <div className="pt-16 lg:pt-20 min-h-screen bg-ivory-50 section-container">
        <h1 className="font-display text-3xl text-stone-900 font-light mb-8 mt-4">My Conversations</h1>
        <div className="grid gap-4">
          {conversations.map((conv) => (
            <Link 
              key={conv.id} 
              href={`/buyer/chat?sellerId=${conv.id}`}
              className="bg-white p-4 flex items-center gap-4 border border-stone-100 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center">
                <User className="w-6 h-6 text-stone-500" />
              </div>
              <div>
                <h2 className="font-medium text-stone-800">{conv.full_name}</h2>
                <p className="text-xs text-stone-400">{conv.role === 'seller' ? 'Seller' : 'Buyer'}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  if (!sellerId) {
    return (
      <div className="pt-16 lg:pt-20 min-h-screen bg-ivory-50 section-container flex flex-col items-center justify-center">
        <h1 className="font-display text-3xl text-stone-900 font-light mb-4">No conversations yet</h1>
        <Link href="/buyer/homepage" className="btn-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="pt-16 lg:pt-20 min-h-screen bg-ivory-50 section-container pb-24 md:pb-12">
      <div className="flex items-center gap-4 mb-6 md:mb-8 mt-4 md:mt-0">
        <Link href="/buyer/chat" className="md:hidden p-2 -ml-2 text-stone-500">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="font-display text-3xl md:text-4xl text-stone-900 font-light">
          Live Chat
        </h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-stone-100 flex flex-col h-[70vh]">
        {/* Chat Header */}
        <div className="border-b border-stone-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center overflow-hidden">
            {seller?.avatar_url ? (
              <img src={seller.avatar_url} alt={seller.full_name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-stone-500" />
            )}
          </div>
          <div>
            <h2 className="font-medium text-stone-800">
              {seller?.full_name || "Seller"}
            </h2>
            <p className="text-xs text-green-600">Online</p>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-stone-50/50">
          {messages.length === 0 ? (
            <div className="text-center text-stone-400 text-sm mt-10">No messages yet. Say hi!</div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_id === currentUser?.id ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
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
            ))
          )}
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-stone-100 rounded-b-lg">
          <form onSubmit={handleSend} className="flex gap-2 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-stone-50 border border-stone-200 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400 transition-all"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-stone-900 text-white rounded-full p-3 hover:bg-stone-800 disabled:opacity-50 transition-colors flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
