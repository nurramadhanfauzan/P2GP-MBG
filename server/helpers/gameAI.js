const choices = [
    'rock',
    'paper',
    'scissors'
]

const aiMove = () => {
    const random = Math.floor(Math.random() * 3)
    return choices[random]
}

module.exports = aiMove