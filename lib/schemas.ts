// lib/schemas.ts
import { z } from 'zod';

export const PostSchema = z.object({
  title: z
    .string()
    .min(1, '제목을 입력해주세요.')
    .max(100, '제목은 100자 이내로 입력해주세요.'),
  content: z
    .string()
    .min(1, '내용을 입력해주세요.')
    .max(10000, '내용은 10,000자 이내로 입력해주세요.'),
  status: z.enum(['private', 'public', 'timed', 'selective']),
  publishAt: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      return !isNaN(Date.parse(val));
    }, { message: '올바른 날짜를 입력해주세요.' }),
  tags: z.array(z.string()).max(5).optional(),
  allowedUsers: z.array(z.string()).optional(),
});

export type PostInput = z.infer<typeof PostSchema>;