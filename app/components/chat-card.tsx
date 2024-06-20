'use client';

import React from 'react';
import { MemoizedReactMarkdown } from './markdown';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Skeleton } from './ui/skeleton';

export interface ChatCardProps {
  message?: string;
  loading?: boolean;
}

export const ChatCard: React.FC<ChatCardProps> = ({ message, loading }) => {
  if (loading && !message) {
    return (
      <div className="space-y-2 w-full">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    );
  }
  if (!message) return null;
  return (
    <Card>
      <CardHeader>
        <CardDescription>ChatBot:</CardDescription>
      </CardHeader>
      <CardContent>
        <MemoizedReactMarkdown
          className="break-words text-sm"
          components={{
            p({ children }) {
              return <p className="mb-2 last:mb-0">{children}</p>;
            },
          }}
        >
          {message}
        </MemoizedReactMarkdown>
      </CardContent>
    </Card>
  );
};
