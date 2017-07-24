# 6697-bot

This is a bot for #lounge on Telegram.


## Setup

Firstly, you need to install the dependencies:

```
npm install
```

While this is running, you can create a `config.json`, which will be passed to
[coffea's connect function](https://github.com/caffeinery/coffea/tree/1.0-beta#connecting):

```js
[
  {
    "protocol": "telegram",
    "token": "INSERT_TELEGRAM_TOKEN_HERE"
  }]
```

**Important:** Don't forget to install the protocol via `npm install coffea-telegram`.



## Running

Now that your bot is set up, it's time to run it:

```
npm start
```

During development, you can also use:

```
npm run start:dev
```

To enable debug messages and run the code with on-the-fly compilation
(via `babel-node`).

Or you can use:

```
npm run watch
```

To automatically restart the bot when the code changes.
