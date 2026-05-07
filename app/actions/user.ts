// app/actions/user.ts
'use server';

import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { auth } from '@/lib/auth';
import { getUsers, saveUsers } from '@/lib/github';
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string().min(2, '아이디는 2자 이상이어야 합니다.').max(20, '아이디는 20자 이내여야 합니다.').regex(/^[a-zA-Z0-9_]+$/, '아이디는 영문, 숫자, 언더스코어만 사용 가능합니다.'),
  name: z.string().min(1, '이름을 입력해주세요.').max(20, '이름은 20자 이내여야 합니다.'),
  password: z.string().min(4, '비밀번호는 4자 이상이어야 합니다.'),
  role: z.enum(['admin', 'moderator', 'user']),
});

// 유저 추가
export async function createUser(formData: FormData) {
  const session = await auth();
  const user = session?.user as any;
  if (user?.role !== 'admin') return { error: '관리자만 접근할 수 있습니다.' };

  const raw = {
    id:       formData.get('id')       as string,
    name:     formData.get('name')     as string,
    password: formData.get('password') as string,
    role:     formData.get('role')     as string,
  };

  const parsed = UserSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const users = await getUsers();
  if (users.find((u: any) => u.id === parsed.data.id)) {
    return { error: '이미 존재하는 아이디입니다.' };
  }

  const hashed = await bcrypt.hash(parsed.data.password, 10);
  users.push({ ...parsed.data, password: hashed });
  await saveUsers(users);

  revalidatePath('/admin');
  return { success: true };
}

// 유저 삭제
export async function deleteUser(targetId: string) {
  const session = await auth();
  const user = session?.user as any;
  if (user?.role !== 'admin') return { error: '관리자만 접근할 수 있습니다.' };
  if (user.id === targetId) return { error: '본인 계정은 삭제할 수 없습니다.' };

  const users = await getUsers();
  const filtered = users.filter((u: any) => u.id !== targetId);
  await saveUsers(filtered);

  revalidatePath('/admin');
  return { success: true };
}

// 비밀번호 변경
export async function changePassword(targetId: string, formData: FormData) {
  const session = await auth();
  const user = session?.user as any;
  if (user?.role !== 'admin') return { error: '관리자만 접근할 수 있습니다.' };

  const password = formData.get('password') as string;
  if (!password || password.length < 4) return { error: '비밀번호는 4자 이상이어야 합니다.' };

  const users = await getUsers();
  const idx = users.findIndex((u: any) => u.id === targetId);
  if (idx === -1) return { error: '유저를 찾을 수 없습니다.' };

  users[idx].password = await bcrypt.hash(password, 10);
  await saveUsers(users);

  revalidatePath('/admin');
  return { success: true };
}

// app/actions/user.ts 맨 아래에 추가
export async function changeMyPassword(formData: FormData) {
  const session = await auth();
  const user = session?.user as any;
  if (!user) return { error: '로그인이 필요합니다.' };

  const currentPassword = formData.get('currentPassword') as string;
  const newPassword     = formData.get('newPassword')     as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: '모든 항목을 입력해주세요.' };
  }
  if (newPassword.length < 4) {
    return { error: '새 비밀번호는 4자 이상이어야 합니다.' };
  }
  if (newPassword !== confirmPassword) {
    return { error: '새 비밀번호가 일치하지 않습니다.' };
  }

  const users = await getUsers();
  const idx   = users.findIndex((u: any) => u.id === user.id);
  if (idx === -1) return { error: '유저를 찾을 수 없습니다.' };

  const valid = await bcrypt.compare(currentPassword, users[idx].password);
  if (!valid) return { error: '현재 비밀번호가 올바르지 않습니다.' };

  users[idx].password = await bcrypt.hash(newPassword, 10);
  await saveUsers(users);

  return { success: true };
}