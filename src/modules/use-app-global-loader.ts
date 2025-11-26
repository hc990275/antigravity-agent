import {create} from "zustand";
import {LanguageServerResponse} from "@/commands/types/language-server-response.types.ts";
import type {AntigravityAccount} from "@/commands/types/account.types.ts";
import {LanguageServerCommands} from "@/commands/LanguageServerCommands.ts";

type State = {
  loading: boolean
  label: string
}

type OpenConfig = {
  label: string
  duration?: number
}

type Actions = {
  open: (config: OpenConfig) => void,
  close: () => void,
}

export const useAppGlobalLoader = create<State & Actions>((setState, getState) => ({
  loading: false,
  label: '',
  open: (config: OpenConfig) => {
    const {label, duration = 1000} = config
    setState({loading: true, label})
    setTimeout(() => setState({loading: false, label: ''}), duration)
  },
  close: () => setState({loading: false, label: ''}),
}))
