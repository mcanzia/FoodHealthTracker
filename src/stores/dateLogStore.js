import { defineStore } from 'pinia'

export const useDateLogStore = defineStore('dateLogStore', {
    state: () => ({
        dateLogId: "",
        date: new Date(),
        foodItems: [],
      }),
    actions: {

    }
})