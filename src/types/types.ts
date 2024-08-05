export type DialogueMessage = {
    type: "dialogue"|"command",
    male: {
      text: string,
      expression: string
    },
    female: {
      text: string,
      expression: string
    },
    nonbinary: 
      {
      text: string,
      expression: string
    }
  };