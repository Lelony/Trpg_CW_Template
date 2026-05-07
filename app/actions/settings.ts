// app/actions/settings.ts
'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { getSettings, saveSettings } from '@/lib/github';

export async function fetchSettings() {
  return await getSettings();
}

export async function updateSettings(formData: FormData) {
  const session = await auth();
  const user = session?.user as any;
  if (user?.role !== 'admin') return { error: '관리자만 접근할 수 있습니다.' };

  const settings = {
    siteName:        formData.get('siteName')        as string,
    siteDescription: formData.get('siteDescription') as string,
    shinobiModeName: formData.get('shinobiModeName') as string,
    snsModeName:     formData.get('snsModeName')     as string,
    shinobi: {
      bg:          formData.get('shinobi_bg')          as string,
      bgCard:      formData.get('shinobi_bgCard')      as string,
      bgHeader:    formData.get('shinobi_bgHeader')    as string,
      border:      formData.get('shinobi_border')      as string,
      borderHover: formData.get('shinobi_borderHover') as string,
      text:        formData.get('shinobi_text')        as string,
      textSub:     formData.get('shinobi_textSub')     as string,
      textMuted:   formData.get('shinobi_textMuted')   as string,
      accent:      formData.get('shinobi_accent')      as string,
      accentText:  formData.get('shinobi_accentText')  as string,
      tag:         formData.get('shinobi_tag')         as string,
    },
    sns: {
      bg:          formData.get('sns_bg')          as string,
      bgCard:      formData.get('sns_bgCard')      as string,
      bgHeader:    formData.get('sns_bgHeader')    as string,
      border:      formData.get('sns_border')      as string,
      borderHover: formData.get('sns_borderHover') as string,
      text:        formData.get('sns_text')        as string,
      textSub:     formData.get('sns_textSub')     as string,
      textMuted:   formData.get('sns_textMuted')   as string,
      accent:      formData.get('sns_accent')      as string,
      accentText:  formData.get('sns_accentText')  as string,
      tag:         formData.get('sns_tag')         as string,
    },
  };

  try {
    await saveSettings(settings);
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (e: any) {
    return { error: e.message ?? '설정 저장에 실패했습니다.' };
  }
}