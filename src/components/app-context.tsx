import React, { createContext, useState, ReactNode, useMemo } from 'react';

// 定义 context 的类型
interface AppContextType {
  previewMode: boolean;
  walletAddress: string;
  setPreviewMode: (mode: boolean) => void;
  setWalletAddress: (address: string) => void;
}

// 创建 context
export const AppContext = createContext<AppContextType | undefined>(undefined);

// 创建 Provider 组件
interface AppProviderProps {
  children: ReactNode;
}

// 使用函数声明来定义组件
export function AppProvider({ children }: AppProviderProps): JSX.Element {
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>('');

  const value = useMemo(
    () => ({
      previewMode,
      walletAddress,
      setPreviewMode,
      setWalletAddress,
    }),
    [previewMode, walletAddress],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// 创建自定义 hook 以便于使用 context
export function useAppContext(): AppContextType {
  const context = React.useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
