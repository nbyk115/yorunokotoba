/**
 * SIGNATURE_PHRASES: ICP §5-1 姉貴分の本音モード ワンライナー (24 entries, DREAM_TYPES と 1:1)
 * AI 推奨の平均値（「きっとうまくいくよ」「ゆっくり休んでね」）を断り、
 * 「同じ夜にいる者どうしの対等さ」を言語化する温度。
 * 識別性ゲート: 全コピーに「AI 推奨の平均値を、ここで断った」が言語化できること。
 */
export const SIGNATURE_PHRASES: Record<string, string> = {
  yume_kobuta: '隠す気ないでしょ、顔に出てるよ',
  umi_rakko: '怒ってるのに「別にいいよ」って言うの、今日もだよ',
  mori_risu: '8割途中でやめてるの、わかって始めてるでしょ',
  hana_panda: '断れなくて引き受けたやつ、また増えたでしょ',
  sora_unicorn: 'みんなに合わせるより、はみ出したままでいいと思うよ',
  yuki_hakucho: '60点で止まるの怖いだけで、0か100じゃないよ',
  niji_koala: '布団の中でまだ考えてる、わたしもだけど',
  hi_no_tora: '「大丈夫ひとりでやれる」って言いながら限界でしょ',
  tsuki_hyou: '全部読めてるくせに、黙ってるだけでしょ',
  hoshi_kuma: '「大丈夫」って言ってるけど、大丈夫じゃないでしょ',
  kaze_uma: '飽きたのわかってるよ、続けるより次に行っていいよ',
  kaze_ookami: '離れた振りして、全部ちゃんと見てるよね',
  honoo_phoenix: '今日も全部燃やしたでしょ、ご飯は？',
  sakura_usagi: '「どっちでもいい」は優しさだから、決めなくていいよ',
  yozora_fukurou: 'もう情報足りてるよ、動けないのは別の理由だよ',
  taiyou_lion: '「大丈夫任せて」って言ったあと、内心やばかったでしょ',
  ame_iruka: '「私がやる」って言った瞬間、後悔したでしょ',
  komorebi_shika: '「また今度ね」ってもう何回言ったか、数えてないよね',
  yuuyake_kitsune: '笑顔で「大丈夫」って言った夜、疲れてたでしょ',
  akatsuki_washi: '細かいことは苦手だよね、それでも飛べてるでしょ',
  shizuku_penguin: '休日も「何か生産的なことを」って考えてるでしょ',
  nijiiro_dragon: '「何言ってるかわからない」って言われた、今日もでしょ',
  mayonaka_neko: 'まだ起きてるんだ。…まあ、わたしもだけど',
  hana_poodle: '褒められると何でもOKしちゃうの、今日も発動したでしょ',
};

export function getSignaturePhrase(charaId: string): string | undefined {
  return SIGNATURE_PHRASES[charaId];
}
