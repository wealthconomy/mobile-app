import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface BankAccount {
  id: string;
  name: string;
  bankName: string;
  accountNumber: string;
}

export interface Card {
  id: string;
  holderName: string;
  lastFour: string;
  brand: "mastercard" | "visa";
  isDefault: boolean;
}

interface PaymentState {
  banks: BankAccount[];
  cards: Card[];
}

const initialState: PaymentState = {
  banks: [
    {
      id: "1",
      name: "James Jackson",
      bankName: "Opay",
      accountNumber: "62345278396",
    },
  ],
  cards: [
    {
      id: "1",
      holderName: "Simon Mike",
      lastFour: "4252",
      brand: "mastercard",
      isDefault: true,
    },
    {
      id: "2",
      holderName: "Simon Mike",
      lastFour: "8372",
      brand: "visa",
      isDefault: false,
    },
  ],
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
      state.cards.sort((a, b) =>
        a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1,
      );
    },
    removeCard: (state, action: PayloadAction<string>) => {
      state.cards = state.cards.filter((card) => card.id !== action.payload);
    },
    setDefaultCard: (state, action: PayloadAction<string>) => {
      state.cards.forEach((card) => {
        card.isDefault = card.id === action.payload;
      });
      // Sort so default is first
      state.cards.sort((a, b) =>
        a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1,
      );
    },
  },
});

export const { addBank, removeBank, addCard, removeCard, setDefaultCard } =
  paymentSlice.actions;
export default paymentSlice.reducer;
