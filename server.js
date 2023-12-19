const net = require('net')

let clientNum = 1


const clients = []

const server = net.createServer(client => {
    const adminPassword = "123"
    const newClientName = `User${clientNum}`
    clientNum++
    client.write(`Welcome ${newClientName}`)
    clients.push({info: client, userName: newClientName})
    const enterMessage = `${newClientName} connected`
    broadcast(enterMessage, client)


    client.setEncoding('utf-8')
    client.on('data', (data) => {
        let clientUserName
        clients.forEach(user => {
            if(user.info === client){
                clientUserName = user.userName
            }
        })

        if(data[0] === '/'){
            const command = data.split(' ')

            //whisper command
            if(command[0] === '/w'){
                const targetUserName = command[1]
                let whisperMessageText = command[2]

                for(i=3; i<command.length; i++){
                    whisperMessageText += ` ${command[i]}`
                }

                let targetUser
                clients.forEach(user => {
                    if(user.userName === targetUserName){
                        targetUser = user.info
                    }
                })
                if(targetUser === client){
                    client.write(`You can't whisper to yourself`)
                } else if(command.length < 2){
                    client.write(`Missing a target user and a whisper message`)
                } else if(command.length < 3){
                    client.write(`Missing a whisper message`)
                } else if(targetUser === undefined){
                    client.write(`${targetUserName} is not an online user`)
                } else {
                    const whisperMessage = `${clientUserName} whispered: "${whisperMessageText}"`
                    targetUser.write(whisperMessage)
                }
                //username command
            } else if(command[0] === '/username'){
                let newUserName = command[1]
                let userNum = null
                let duplicateUserName = false

                clients.forEach((user, index) => {
                    if(user.userName === clientUserName){
                        userNum = index
                    }
                    if(user.userName == newUserName){
                        duplicateUserName = true
                    }
                })
                if(command.length > 2){
                    client.write('Usernames cannot conatin spaces')
                } else if(newUserName == undefined){
                    client.write(`Your username is "${clients[userNum].userName}"`)
                } else if(newUserName == clients[userNum].userName){
                    client.write(`${newUserName} is already your username`)
                } else if(duplicateUserName){
                    client.write(`${newUserName} is already taken`)
                } else {
                    broadcast(`${clients[userNum].userName} changed their name to "${newUserName}"`, client)
                    clients[userNum].userName = newUserName
                    client.write(`New username: ${newUserName}`)
                }
                //kick command
            } else if(command[0] === "/kick"){
                let kickedUser = null
                let kickedUserIndex = null
                clients.forEach((user, index) => {
                    if(user.userName === command[1]){
                        kickedUser = user.info
                        kickedUserIndex = index
                    }
                })
                if(kickedUser == null){
                    client.write(`${command[1]} is not an online user`)
                } else if(kickedUser === client){
                    client.write(`You can't kick yourself`)
                } else if(command[2] !== adminPassword || command.length > 3){
                    client.write(`incorrect admin password`)
                } else {
                    kickedUser.write(`You have been kicked off the chat`)
                    kickedUser.end()
                    clients.splice(kickedUserIndex, 1);
                    broadcast(`${command[1]} left the chat`)
                }
                //clientlist command
            } else if(command[0] === '/clientlist'){
                let clientList = ''
                clients.forEach((user, index) => {
                    clientList += `"${user.userName}"${user.info === client ? "(you)":""}, `
                })
                client.write(clientList)
            } else {
                client.write(`invalid command`)
            }
        } else {
            const message = `${clientUserName}: "${data}"`
            broadcast(message, client)
        }
    })

}).listen(5000, () => {
    console.log(`Listening on port ${server.address().port}`)
})

function broadcast(message, sender) {
    clients.forEach(client => {
        if(client.info !== sender){
            client.info.write(message)
        }
    });
    console.log(message)
}
