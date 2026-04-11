export type ComboboxState = {
  open: boolean;
  inputValue: string;
  activeIndex: number;
  forceClear: boolean;
};

export type ComboboxAction =
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | { type: 'SET_INPUT'; value: string }
  | { type: 'SET_ACTIVE_INDEX'; index: number }
  | { type: 'SELECT' }
  | { type: 'CLEAR'; keepFocus?: boolean }
  | { type: 'RESET' };

export const INITIAL_COMBOBOX_STATE: ComboboxState = {
  open: false,
  inputValue: '',
  activeIndex: -1,
  forceClear: false,
};

export function comboboxReducer(
  state: ComboboxState,
  action: ComboboxAction,
): ComboboxState {
  switch (action.type) {
    case 'OPEN':
      return { ...state, open: true, activeIndex: -1 };
    case 'CLOSE':
      return { ...state, open: false, activeIndex: -1 };
    case 'SET_INPUT':
      return {
        ...state,
        inputValue: action.value,
        activeIndex: -1,
        open: true,
      };
    case 'SET_ACTIVE_INDEX':
      return { ...state, activeIndex: action.index };
    case 'SELECT':
      return { ...state, forceClear: false, activeIndex: -1, open: false };
    case 'CLEAR':
      return {
        ...state,
        forceClear: true,
        inputValue: '',
        activeIndex: -1,
        open: action.keepFocus ? state.open : false,
      };
    case 'RESET':
      return INITIAL_COMBOBOX_STATE;
    default:
      return state;
  }
}
