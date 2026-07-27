export type User = {
  id: string;
  email: string;
  createdAt: string;
};

export type Conversation = {
  id: string;
  title: string;
  createdAt: string;
  userId: string;
};
export type ConversationsGroupBy = "none" | "date";
