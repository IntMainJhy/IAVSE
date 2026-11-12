'use client';

import {createContext, useContext, type ReactNode} from 'react';
import {useResource} from '@/components/PageResources';

type PlatformUser = {
  id: string;
  role: string;
  status: string;
  username: string;
  nickname: string;
  displayName?: string;
  avatarId?: string;
  siteOwner?: boolean;
  canPublish?: boolean;
  verification?: string;
};

const Account = createContext<{user: PlatformUser | null; loading: boolean}>({user: null, loading: true});

export function PlatformAccountProvider({children}: {children: ReactNode}) {
  const auth = useResource('/api/auth/me');
  return <Account.Provider value={{user: auth.data?.user ?? null, loading: auth.loading}}>{children}</Account.Provider>;
}

export function usePlatformAccount() {
  return useContext(Account);
}
