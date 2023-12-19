const net = require('net')
const process = require('process')

const client = net.createConnection({port: 5000}, () => {
    console.log(`Connected to server`)
})

client.setEncoding('utf-8')
client.on("data", (data) => {
        console.log(data)
})

process.stdin.setEncoding('utf-8')
process.stdin.on('readable', () => {
    let userInput
    while((userInput = process.stdin.read()) !== null){
        client.write(userInput.toString().trim())
    }
})