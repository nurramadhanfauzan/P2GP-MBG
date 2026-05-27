const checkWinner = (player1, player2) => {

    if (player1 === player2) {
        return 'draw'
    }

    if (player1 === 'rock' && player2 === 'scissors') {
        return 'player1'
    }

    if (player1 === 'paper' && player2 === 'rock') {
        return 'player1'
    }

    if (player1 === 'scissors' && player2 === 'paper') {
        return 'player1'
    }

    return 'player2'
}

module.exports = checkWinner