
const { get } = require("axios")
class Handler {
    constructor({ rekoSvc, translatorSvc }) {
        this.rekoSvc = rekoSvc
        this.translatorSvc = translatorSvc
    }

    async detectImageLabels(buffer) {
        const result = await this.rekoSvc.detectImageLabels({
            Image: {
                bytes: buffer
            }
        }).promise()

        const workingItems = result.labels
            .filter(({ Confidence }) => Confidence > 80)

        const names = workingItems
            .map(({ Name }) => Name)
            .join(' and ')

        return { names, workingItems }
    }

    async translateText(text) {
        const params = {
            SourceLanguage: "en",
            TargetLanguageCode: "pt",
            Text: text
        }

        const { TranslatedTextx } = await this.translatorSvc.translateText(params).promise();

        return TranslatedTextx.split(" e ")
    }

    formatTextResults(texts, workingItems) {
        const finalText = [];
        for (const indexText in texts) {
            const nameInPortuguese = texts[indexText];
            const confidence = workingItems[indexText].Confidence;
            finalText.push(`${confidence.toFixed(2)}% de ser do tipo ${nameInPortuguese}`)
        }

        return finalText.join("\n")
    }

    async getImageBuffer(imageUrl) {
        const response = await get(imageUrl, {
            responseType: "arraybuffer"
        })
        const buffer = Buffer.from(response.data, "base64")
        return buffer
    }


    async main() {
        try {
            const { imageUrl } = event.queryStringParameters;

            console.log("Downloading image...");
            const buffer = this.getImageBuffer(imageUrl)

            console.log("Detecting labels...")
            const { names, workingItems } = await this.detectImageLabels(buffer);

            console.log("Translating to Portuguese...")
            const texts = await this.translateText(names);

            console.log("Handling final object...")
            const finalText = await this.translateText(names);

            console.log("finishing...")

            return {
                statusCode: 200,
                body: `A imagem tem`.concat(finalText)
            }

        } catch (error) {
            console.log("*Error*", error)
            return {
                statusCode: 500,
                body: "Internal server error"
            }
        }

    }
}

const aws = require("aws-sdk")

const reko = new aws.Recognition()
const translator = new aws.Translate()
const handler = Handler({
    rekoSvc: reko,
    translatorSvc: translator
})

module.exports.main = handler.main.bond(handler)