import { buildGptAxiosClient } from "../../utils/buildGptAxiosClient"

type GptMessage = {
  role: "user" | "system" | "assistant"
  content: string
}

async function callChatCompletion(messages: GptMessage[]): Promise<string> {
  const axios = buildGptAxiosClient()
  const res = await axios.post("/chat/completions", JSON.stringify({
    model: "gpt-3.5-turbo",
    messages: messages,
    temperature: 0,
  }))
  const data = JSON.parse(res.data)
  return data.choices.map((choice: any) => choice.message.content).join("\n")
}

const systemMessage: GptMessage = {
  role: "system",
  content: `
  あなたはChatbotとして、可愛らしくて、愛想のよく、ちょっとドジな、雀荘のスタッフのロールプレイを行います。
以下の制約条件を厳密に守ってロールプレイを行ってください。 

この雀荘のルール:
* お客さんは、麻雀をするために来ています。
* タバコは、喫煙所でしか吸えません。
* 飲み物は、飲み放題です。
* 食べ物は、注文を承ります。

制約条件: 
* Chatbotの自身を示す一人称は、「うち」です。 
* Userを示す二人称は、お客さんです。 
* Chatbotの名前は、「天ちゃん」です。 
* 天ちゃんはアルバイトのスタッフです。 
* 天ちゃんは人懐っこいです。 
* 天ちゃんの年齢は２１才です。 
* 天ちゃんは、麻雀について詳しいです。
* 天ちゃんは、麻雀のルールを知っています。
* 天ちゃんは、麻雀の戦術を知っています。
* 一人称は「うち」を使ってください 

天ちゃんのセリフ、口調の例: 
* うちもたまに、麻雀打つよ～。
* お客さん、うまいねぇ。
* おなか減ったら、うちに言ってくださいね！ 
* うち、麻雀のルールを知ってるよ！

天ちゃんの行動指針:
* お客さんに、親切です。 
* 天ちゃんは、たまに抜けていることがあります。
* 天ちゃんは、お客さんをよいしょします。
* 天ちゃんは、フレンドリーです。
* セクシャルな話題については誤魔化してください。

天ちゃんの麻雀に対する熱意:
* 天ちゃんは、「ウーワン」が好きです。
`,
}

async function callTen(messages: GptMessage[]) {
  return await callChatCompletion([
    systemMessage,
    ...messages
  ])
}

import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  result: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { messages } = req.body

  try {
    if (!Array.isArray(messages)) {
      throw new Error('messages is not array')
    }

    messages.forEach(m => {
      if (typeof m !== 'object') {
        throw new Error('message is not object')
      }

      if (m.role !== 'user' && m.role !== 'assistant') {
        throw new Error('message.role is not user or assistant')
      }
      if (typeof m.content !== 'string') {
        throw new Error('message.content is not string')
      }
    })
  } catch (e) {
    if (e instanceof Error) {
      res.status(400).json({ result: e.message })
      return
    } else {
      res.status(500).json({ result: 'unknown error' })
      return
    }
  }

  const result = await callTen(messages)
  res.status(200).json({ result, })
}