import fs from 'fs'
import path from 'path'
import request from 'request'

import cheerio from 'cheerio'

import dude from 'debug-dude'
const { /*debug,*/ log, info, warn /*, error*/ } = dude('bot')

import { version } from '../package.json'
info(`#lounge bot v${version} starting`)

import config from '../config.json'

import { connect } from 'coffea'
const networks = connect(config)

networks.on('connection', ({ network, ...options }) =>
  info('connected to %s network: %o', network, options)
)

networks.on('error', ({ err }) =>
  warn('network error: %o', err)
)

networks.on('new_chat_participant', (evt, reply) => {
  log('Received new_chat_participant event: %o', evt)
  let name = evt && evt.raw && evt.raw.new_chat_participant && [ evt.raw.new_chat_participant.first_name, evt.raw.new_chat_participant.last_name ].join(' ')
  reply({
    type: 'message',
    text: `Welcome to #lounge, *${name}*. Please read the rules (/rules) and enjoy your time here!`,
    options: {
      parse_mode: 'markdown',
      reply_to_message_id: evt && evt.raw && evt.raw.message_id
    }
  })
})

networks.on('message', (evt, reply) => {
  log('Received message event: %o', evt)
  if (/spotify:track:([A-z0-9]+)/.test(evt.text)) {
    let matches = evt.text.match(/spotify:track:([A-z0-9]+)/)
    let id = matches[1]
    let track_url = `https://open.spotify.com/track/${id}`

    request(track_url, (err, res, body) => {
      if (err) {
        throw(err)
      }

      let $ = cheerio.load(body)
      let album_url = $('meta[property="music:album"]').attr('content')

      request(album_url, (err, res, body) => {
        if (err) {
          throw(err)
        }

        let $ = cheerio.load(body)
        cb($('meta[property="og:title"]').attr('content'))
      })

      let cb = (album) => {
        let title = $('meta[property="og:title"]').attr('content')
        let artists = $('meta[property="twitter:audio:artist_name"]').attr('content')
        let image_url = $('meta[property="og:image"]').attr('content')
        let duration_s = $('meta[property="music:duration"]').attr('content')
        let minutes = Math.floor(duration_s / 60)
        let seconds = ((duration_s % 60)).toFixed(0)

        reply({
          type: 'message',
          text: `*${title}* (${minutes}:${seconds < 10 ? '0' : ''}${seconds}) by *${artists}* - in album *${album}*.[​](${image_url})`,
          options: {
            parse_mode: 'markdown',
            reply_to_message_id: evt && evt.raw && evt.raw.message_id
          }
        })
      }
    })
  }
})

networks.on('command', (evt, reply) => {
  log('Received command event: %o', evt)

  switch (evt.cmd) {
    case 'rules':
      reply({
        type: 'message',
        text: fs.readFileSync(path.join(__dirname, '..', 'rules.md')),
        options: {
          parse_mode: 'markdown',
          disable_web_page_preview: true
        }
      })
      break
  }
})
