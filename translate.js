const Translate = require('@google-cloud/translate')
const translate = new Translate({
  projectId: process.env.GOOGLE_PROJECT_ID,
  key: process.env.GOOGLE_API_KEY})
module.exports = async function (msg) {
  const options = {
    from: 'en',
// zh-CN       Chinese (Simplified)
// zh-TW       Chinese (Traditional)
    to: 'zh-CN'
  }
  // console.log('translating:', msg)
  try {
    const data = await translate.translate(msg, options)
    const translation = data[0]
    // const apiResponse = data[1]
    // console.log(translation, apiResponse)
    return translation
  } catch (error) {
    console.error(error)
  }
}
