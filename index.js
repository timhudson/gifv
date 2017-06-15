const { createReadStream } = require('fs')
const { parse } = require('url')
const { send } = require('micro')
const execa = require('execa')
const got = require('got')
const tempWrite = require('temp-write')
const tempfile = require('tempfile')

module.exports = async (req, res) => {
  const { query } = parse(req.url, true)

  if (!query.url) {
    throw new Error('?url must be provided')
  }

  res.setHeader('Content-Type', 'video/mp4')

  const input = await tempWrite(got.stream(query.url))
  const output = tempfile('.mp4')

  await execa('ffmpeg', [
    '-i', input,
    '-movflags', 'faststart',
    '-pix_fmt', 'yuv420p',
    output
  ])
  .then(() => send(res, 200, createReadStream(output)))
}
