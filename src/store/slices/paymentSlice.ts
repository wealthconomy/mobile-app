import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface BankAccount {
  id: string;
  name: string;
  bankName: string;
  accountNumber: string;
}

export type CardBrand = "mastercard" | "visa" | "verve" | "other";

export interface Card {
  id: string;
  holderName: string;
  lastFour: string;
  brand: CardBrand;
  isDefault: boolean;
}

interface PaymentState {
  banks: BankAccount[];
  cards: Card[];
}

const initialState: PaymentState = {
  banks: [],
  cards: [],
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    addBank: (state, action: PayloadAction<BankAccount>) => {
      state.banks.push(action.payload);
    },
    removeBank: (state, action: PayloadAction<string>) => {
      state.banks = state.banks.filter((bank) => bank.id !== action.payload);
    },
    addCard: (state, action: PayloadAction<Card>) => {
      if (action.payload.isDefault) {
        state.cards.forEach((card) => (card.isDefault = false));
      }
      state.cards.push(action.payload);
      // Sort so default is first
      state.cards.sort((a, b) => {
        if (a.isDefault === b.isDefault) return 0;
        return a.isDefault ? -1 : 1;
      });
    },
    removeCard: (state, action: PayloadAction<string>) => {
      state.cards = state.cards.filter((card) => card.id !== action.payload);
    },
    setDefaultCard: (state, action: PayloadAction<string>) => {
      state.cards.forEach((card) => {
        card.isDefault = card.id === action.payload;
      });
      // Sort so default is first
      state.cards.sort((a, b) => {
        if (a.isDefault === b.isDefault) return 0;
        return a.isDefault ? -1 : 1;
      });
    },
  },
});

export const { addBank, removeBank, addCard, removeCard, setDefaultCard } =
  paymentSlice.actions;
export default paymentSlice.reducer;
