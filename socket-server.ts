import { Server as NetServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { NextApiResponse } from 'next'

export type NextApiResponseServerIO = NextApiResponse & {
  socket: any & {
    server: NetServer & {
      io: SocketIOServer
    }
  }
}

export const initSocketServer = (server: any) => {
  if (!server.io) {
    console.log('Initialiserer Socket.IO server...')
    const io = new SocketIOServer(server)
    server.io = io

    io.on('connection', (socket) => {
      console.log('Ny klient tilkoblet:', socket.id)

      socket.on('joinRoom', (userId: string) => {
        socket.join(userId)
        console.log(`Bruker ${userId} koblet til sitt rom`)
      })

      socket.on('disconnect', () => {
        console.log('Klient koblet fra:', socket.id)
      })
    })
  }
  return server.io
}