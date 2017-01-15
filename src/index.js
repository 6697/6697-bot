import fs from 'fs'
import path from 'path'

import dude from 'debug-dude'
const { /*debug,*/ log, info, warn /*, error*/ } = dude('bot')

import { version } from '../package.json'
info(`coffea-starter bot v${version} starting`)

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
  log('Received message event: %o', evt)
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
