const colors = ['w', 'b']

type PlayerState = {
  color: string,
}

type Players = { [key: number]: PlayerState }

function newGame(clientIds: number[]) {
  let players: Players = {};
  for (let i=0; i<clientIds.length; i++){
    const clientId = clientIds[i]
    players[clientId] = {
      color: colors[i],

    }
  }

  const board = []
}

export { newGame }