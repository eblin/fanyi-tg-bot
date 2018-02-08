const fs = require('fs')
const speech = require('@google-cloud/speech')
const client = new speech.SpeechClient({
  projectId: process.env.GOOGLE_PROJECT_ID
})
// https://cloud.google.com/speech/docs/best-practices
// tg uses ogg @ 48000 Hz (according to ffmpeg)
const config = {
  encoding: 'OGG_OPUS',
  sampleRateHertz: 48000,
  languageCode: 'en-US'
}
module.exports = async function (audioFilePath) {
  const audio = {
    content: fs.readFileSync(audioFilePath).toString('base64')
  }
  const request = {
    config: config,
    audio: audio
  }
  try {
    const data = await client.recognize(request)
    const response = data[0]
    return response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n')
  } catch (err) {
    console.error(err)
  }
}
