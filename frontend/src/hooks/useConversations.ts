import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createConversation,
  deleteConversation,
  getConversationsByCurrentUser,
  renameConversation,
} from "../api/conversations";
import { Conversation, ConversationsGroupBy } from "../types/users";

function getDateGroupLabel(dateString?: string): string {
  if (!dateString) return "Undated";
  const date = new Date(dateString);
  const now = new Date();
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round(
    (startOfDay(now) - startOfDay(date)) / (1000 * 60 * 60 * 24),
  );
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays <= 7) return "Previous 7 Days";
  if (diffDays <= 30) return "Previous 30 Days";
  return "Older";
}

const GROUP_ORDER = [
  "Today",
  "Yesterday",
  "Previous 7 Days",
  "Previous 30 Days",
  "Older",
  "Undated",
];

export function groupConversations(
  conversations: Conversation[],
  groupBy: ConversationsGroupBy,
): [string, Conversation[]][] {
  if (groupBy === "none") {
    return [["", conversations]];
  }
  const groups = new Map<string, Conversation[]>();
  for (const conversation of conversations) {
    const label = getDateGroupLabel(conversation.created_at);
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(conversation);
  }
  return GROUP_ORDER.filter((label) => groups.has(label)).map((label) => [
    label,
    groups.get(label)!,
  ]);
}

export function useConversations(enabled: boolean) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [groupBy, setGroupBy] = useState<ConversationsGroupBy>("none");

  const refresh = useCallback(() => {
    if (!enabled) return;
    setLoading(true);
    return getConversationsByCurrentUser()
      .then((data: Conversation[]) => setConversations(data))
      .catch(() => setConversations([]))
      .finally(() => setLoading(false));
  }, [enabled]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(async (title: string) => {
    const created = await createConversation({ title });
    setConversations((prev) => [created, ...prev]);
    return created;
  }, []);

  const rename = useCallback(async (id: string, title: string) => {
    const updated = await renameConversation(id, { title });
    setConversations((prev) => prev.map((c) => (c.id === id ? updated : c)));
    return updated;
  }, []);

  const remove = useCallback(
    async (id: string) => {
      setConversations((prev) => prev.filter((c) => c.id !== id));
      try {
        await deleteConversation(id);
      } catch (err) {
        // Server state may now differ from local state, so re-sync.
        refresh();
        throw err;
      }
    },
    [refresh],
  );

  const grouped = useMemo(
    () => groupConversations(conversations, groupBy),
    [conversations, groupBy],
  );

  return {
    conversations,
    grouped,
    loading,
    groupBy,
    setGroupBy,
    create,
    rename,
    remove,
  };
}
