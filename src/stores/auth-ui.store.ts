import { create } from "zustand";

type AuthUIState = {
    isOpen: boolean;
    callback?: () => void;

    open: (cb?: () => void) => void;
    close: () => void;

    accessToken: string | null;
    setAccessToken: (token: string | null) => void;
};

export const useAuthUIStore = create<AuthUIState>((set) => ({
    isOpen: false,
    callback: undefined,

    open: (cb) =>
        set({
            isOpen: true,
            callback: cb,
        }),

    close: () =>
        set({
            isOpen: false,
            callback: undefined,
        }),

    accessToken: null,
    setAccessToken: (token) => set({ accessToken: token }),
}));