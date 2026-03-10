import React, { createContext, useContext, useState, useCallback } from "react";

interface ModalOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  type?: "danger" | "info" | "success";
}

interface ModalContextType {
  showModal: (options: ModalOptions) => void;
  hideModal: () => void;
  modalState: {
    isVisible: boolean;
    options: ModalOptions | null;
  };
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [options, setOptions] = useState<ModalOptions | null>(null);

  const showModal = useCallback((newOptions: ModalOptions) => {
    setOptions(newOptions);
    setIsVisible(true);
  }, []);

  const hideModal = useCallback(() => {
    setIsVisible(false);
  }, []);

  return (
    <ModalContext.Provider
      value={{ showModal, hideModal, modalState: { isVisible, options } }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useGlobalModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useGlobalModal must be used within a ModalProvider");
  }
  return context;
}
