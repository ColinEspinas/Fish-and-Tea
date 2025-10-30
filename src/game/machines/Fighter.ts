import { setup } from 'xstate'

export const fighterMachine = setup({
  types: {} as {
    events:
      | { type: 'move.start' }
      | { type: 'move.end' }
      | { type: 'status.start' }
      | { type: 'status.end' }
      | { type: 'damage.apply' }
      | { type: 'hurt.start' }
      | { type: 'hurt.end' }
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QDMCWUAWAXMAnAdKhADZgDEsWAhlgK6z6VW5YDaADALqKgAOA9rFRZU-AHY8QAD0QAmWQDZ8AdgCcARgXKArOoAcCvQGYALOwUAaEAE9E+2fk0LnJ9exOK9egL7eraTBwCIlIyAFt+ADcwRmoWDm4kEAEhEXFJGQRZE1V8IyM9bRzZAtcTUytbBAK8-KNZbT11eQUSzV9-dGw8QhJyDFoWWOY2LkkU4VEJJMzZdgcdbTmFevz3bUq5DRUc1VVdEyWChQ6QAO6CAZYyCCowqhh8Kl5eYmsE8cFJ9JnEQ+18M4tOxNNl2HpVBUbIgjI1avlyuCjPsliZTucgvgrlgyNj8GAxBAPkkJmlpqBZuZ4fltOwjOojApUZtqocdntIdpYRpVuiupiItFwlEYgSiWMSV8yRk5Et8BpnMoTCYtPJmiYWft8OxtPt1LrTIpISc-Gd+T0mHRYJAKNQrfjCcS+FKpjKsupcupDoVYUYdXociySnpHEDWuUuQVlCbTWJ+BA4JIMXhPqlXb8EABaSzQrMmEPGBHsfZ6ZTq6N8wI9EJgVPfcnSP6yTUAnX7WQQ5zaBTK1SVi5YwZYOvSjNRvLyVTyWHKZRNAxB7ZKvYBqdK4r9gUikfpikw0sT2RTkraWfznNVLVtpadpk9kzKTcWu30SA7n576oH+pH6enuf6Bedh6A4ThaGWjLdsisi+L4QA */
  id: 'fighter',
  initial: 'idle',
  states: {
    idle: {
      on: {
        'move.start': 'move',
        'hurt.start': 'hurt',
        'status.start': 'statused',
      },
    },

    hurt: {
      on: {
        'damage.apply': 'hurt',
        'hurt.end': 'idle',
      },
    },

    move: {
      on: {
        'move.end': 'idle',
      },
    },

    statused: {
      on: {
        'status.end': 'idle',
      },
    },
  },
})
