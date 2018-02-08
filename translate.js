const Translate = require('@google-cloud/translate')
const translate = new Translate({
  projectId: process.env.GOOGLE_PROJECT_ID
})
module.exports = async function (msg) {
  if (msg.length < 3) return Promise.reject(new Error('Message to translate needs to be 3 characters or longer.'))
  const options = {
    from: 'en',
// zh-CN       Chinese (Simplified)
// zh-TW       Chinese (Traditional)
    to: 'zh-CN'
  }
  // console.log('translating:', msg)
  try {
    const data = await translate.translate(msg, options)
    // const apiResponse = data[1]
    // console.log(translation, apiResponse)
    return data[0]
  } catch (error) {
    console.error(error)
  }
}
