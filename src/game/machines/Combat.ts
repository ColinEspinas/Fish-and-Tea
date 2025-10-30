import { setup } from 'xstate'

export const combatMachine = setup({
  types: {
    events: {} as
    | { type: 'combat.next' }
    | { type: 'player.move' }
    | { type: 'player.next', movesPoints?: number }
    | { type: 'combat.start' }
    | { type: 'player.cancel' }
    | { type: 'player.target' }
    | { type: 'player.endTurn' }
    | { type: 'enemies.next' },
  },
  guards: {
    hasMovePointsLeft: (_, params: { movesPoints: number }) => params.movesPoints > 0,
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QGMD2BbARgQwC4DpZdsAnXASwDsoBiNLPQ4sgbQAYBdRUAB1VnIVUlbiAAeiAIwA2AMwB2fAFYAnGwAsStisnrJSyQBoQAT0Tz1K-ACZr62doAc8x9bkBfd8fo4CPADbYJmAkACoAriSUTKS4NAFBIfiUYGK47FxIIHwCQiJZEgjWkhr4jkqOkrKyKo6y0irqxmYIJdLW+HpsbLIybPKqSp7eGL74CcFhkdFEsQDKxLjhsPGBk8mp6ZyiOYLkwqKFdmySnQ6NcifS8gPNUmztnSU9fQMqQ14gPowTIRFR+CgJHIEFWiRI+GYMC2mV4-D2BwKiDsMmUbkk8n00iUBkcdwQziUNg0+nk9Vk6hu0mGX1GPzWf2mgOBoN+ELAlAg-0oGR28Lyh2R12knWKjgujQqt1M90eXRK1hcvQxHxGDD8DKmAKhYAo1DB63QqAAbmBeVldgKkUVeuoyrodBp1A9NPJ8TciZSHu8KcUMZIad8NeDuZDSNCqLQ2fhkNhKMgwP5zXDcvt8qAjrZHPgXkpbPoHgY3TKEDpZPgHI42NZqrYeqraerxprQxyIAs8MsDUkUmlk9l+WnBQgKToc0pMaoq5pJHiS41s467A4lOTZNZA3Tg5NQ0bTd2Ib2YXzU4iM0LyjYyRZnC55P1pPjnooZM6SvoJ-V5Jum2zdyawAPDY+0kWEB1PdNxEQFdThUORZEcSprDg8kn2rctpGcewtEaSl1EcH8xj-Jk2zoLdgOPC1BzPKCR0pbN1HUaRNGqFQbhKYsWkpIlbzzRxpBKfj9FkQjGA5MB0HIOBQ1mMgaHEyS4Ao-tLSHa1rG0EUH347Rqw0il8UYxQXmvVRMIE79PiDfAFKk2AZOYXAOyWFZbKUo8VOoyCjhqDpmLY10y36JoSyMnNejke8Kl0OwG2stz7KZPc4HklJFNgZTtioiDhzceQOhcXFnFqfojFCylwpkBQ2Gi9RYtEggEtbTlnK7BLMrA1SaKOOCOg02dFW6dpq0fcrjN6Uy4KEyy1TGJqSM5Mimw8rKUwRbzoKqEV6jzb0eng-EpXwNiapcNp7B6BrmxDJkgRBIDks8nL1OkbEbEQ6QekcSw2EQ2R8UaF9mJOE4cTJa5PE+ShUAgOBRCDE91uHXQKXwV7rhq50pspfFFQ6ex9HeSpEJxJRqSs8jZL1KBEatc9WnwvzXqirHMJxks2ZzOpXusZxihUd4ruIqJabU+nJBUVGqg0VQ2MlmtRpaTDswxfpSsqX7BYp38WyZKnRe6qRag6aXNAF+R5fqNDMPCvN1wqZwBJE7WiN1gEqda+BsqR9TrDJsoXBUGs7HvBRrY6EHnlXej9CFt3ojuiADY2ooCeUD7-PwpRGIBpj8HkOQ4NfTDKzjm7tXDXVI2T3KQ7RhxGIxAZvrKlo6j68o8uK51tDLncFvbRZlhr61qjlOqKhqPR+c4xBGisLplxqtcNxd+ly+iZKR-p5Cq3wd9CoaBoMRClpGlOAuRoeBDbHwvvGQBNtt9o8k7WQ64XGratvtPufLCeasF1VzwVXrNMSaU7LcmfoUCWvN87YUVDidEs58SyFUPnXok85Z-QxFdea7tHLQKNgXeBaDEF5gEigsaygJoKDMtNPBEDpJ60cp7IhRQ-YimcOKYOXow7UNXFVKKlQ6qaEYRJSBSUAJezWnTWiftVydFxDiRi30La-wQGFQRkUaoiL9uI9KzVB6dhkeBH2O86jlilH7SQMU1D2EMhVbR1Var6LXo1JhiVH6cnYb0GsOYeiS3RtUCwitEBaIii4vRHxPBAA */
  id: 'combat',
  initial: 'starting',
  states: {
    starting: {
      on: {
        'combat.start': {
          target: 'playerTurn',
        },
      },
    },
    playerTurn: {
      initial: 'start',
      states: {
        start: {
          on: {
            'player.next': {
              target: 'startStatus',
            },
          },
        },

        startStatus: {
          on: {
            'player.next': {
              target: 'grid',
            },
          },
        },

        grid: {
          on: {
            'player.target': {
              target: 'targeting',
            },

            'player.endTurn': {
              target: 'endStatus',
            },

            'player.move': 'move',
          },
        },

        targeting: {
          on: {
            'player.move': {
              target: 'move',
            },
            'player.cancel': {
              target: 'grid',
            },
          },
        },

        endStatus: {
          on: {
            'player.next': {
              target: 'end',
            },
          },
        },

        move: {
          on: {
            'player.next': [{
              target: 'grid',
              guard: {
                type: 'hasMovePointsLeft',
                params: ({ event }) => ({
                  movesPoints: event.movesPoints ?? 0,
                }),
              },
            }, {
              target: 'endStatus',
            }],
          },
        },

        end: {
          on: {
            'combat.next': {
              target: '#combat.enemiesTurn',
            },
          },
        },
      },
    },
    enemiesTurn: {
      initial: 'start',
      states: {
        start: {
          on: {
            'enemies.next': {
              target: 'startStatus',
            },
          },
        },
        startStatus: {
          on: {
            'enemies.next': {
              target: 'moves',
            },
          },
        },
        moves: {
          on: {
            'enemies.next': {
              target: 'endStatus',
            },
          },
        },
        endStatus: {
          on: {
            'enemies.next': {
              target: 'end',
            },
          },
        },
        end: {
          on: {
            'combat.next': {
              target: '#combat.playerTurn',
            },
          },
        },
      },
    },
  },
})
