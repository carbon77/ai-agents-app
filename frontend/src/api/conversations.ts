import { apiFetch } from "./api";

const BASE_PATH = "/conversations";

/**
 * POST /conversations/
 * Create a new conversation for the current user.
 */
export async function createConversation(data: { title: string }) {
  const res = await apiFetch(`${BASE_PATH}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`Failed to create conversation: ${res.status}`);
  }
  return res.json();
}

/**
 * GET /conversations/me
 * Get all conversations belonging to the current user.
 */
export async function getConversationsByCurrentUser() {
  const res = await apiFetch(`${BASE_PATH}/me`, {
    method: "GET",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch conversations: ${res.status}`);
  }
  return res.json();
}

/**
 * PATCH /conversations/{conversation_id}
 * Rename an existing conversation.
 */
export async function renameConversation(
  conversationId: string,
  data: { title: string },
) {
  const res = await apiFetch(`${BASE_PATH}/${conversationId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`Failed to rename conversation: ${res.status}`);
  }
  return res.json();
}

/**
 * DELETE /conversations/{conversation_id}
 * Delete a conversation.
 */
export async function deleteConversation(conversationId: string) {
  const res = await apiFetch(`${BASE_PATH}/${conversationId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(`Failed to delete conversation: ${res.status}`);
  }
  return res.json();
}
